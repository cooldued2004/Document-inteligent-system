"""
Document Information Extraction Module

This module handles:
- Text extraction from PDF and TXT files
- Named Entity Recognition using Hugging Face transformers
- Structured entity extraction and formatting
"""

import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import fitz  # PyMuPDF
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification


class DocumentExtractor:
    """
    Main class for extracting information from documents.
    
    Handles PDF and TXT file processing and uses BERT-based NER
    to extract entities like names, organizations, locations, and dates.
    """
    
    def __init__(self, model_name: str = "dslim/bert-base-NER"):
        """
        Initialize the DocumentExtractor with a NER model.
        
        Args:
            model_name: Hugging Face model identifier for NER
        """
        self.model_name = model_name
        self.ner_pipeline = None
        self._load_model()
    
    def _load_model(self):
        """Load the NER model pipeline."""
        try:
            print(f"Loading NER model: {self.model_name}")
            # Explicitly use PyTorch framework
            import torch
            self.ner_pipeline = pipeline(
                "ner",
                model=self.model_name,
                aggregation_strategy="simple",
                framework="pt"  # Explicitly use PyTorch
            )
            print("NER model loaded successfully")
        except Exception as e:
            raise RuntimeError(f"Failed to load NER model: {str(e)}")
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """
        Extract raw text from a PDF file.
        
        Args:
            file_content: PDF file content as bytes
            
        Returns:
            Extracted text as a string
            
        Raises:
            ValueError: If PDF extraction fails
        """
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            text_parts = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_parts.append(page.get_text())
            
            doc.close()
            text = "\n".join(text_parts).strip()
            
            if not text:
                raise ValueError("PDF appears to be empty or contains no extractable text")
            
            return text
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_txt(self, file_content: bytes) -> str:
        """
        Extract text from a TXT file.
        
        Args:
            file_content: TXT file content as bytes
            
        Returns:
            Text content as a string
            
        Raises:
            ValueError: If text extraction fails
        """
        try:
            # Try UTF-8 first, fallback to latin-1 if needed
            try:
                text = file_content.decode('utf-8')
            except UnicodeDecodeError:
                text = file_content.decode('latin-1')
            
            text = text.strip()
            
            if not text:
                raise ValueError("TXT file appears to be empty")
            
            return text
        except Exception as e:
            raise ValueError(f"Failed to extract text from TXT file: {str(e)}")
    
    def extract_text(self, file_content: bytes, file_extension: str) -> str:
        """
        Extract text from a document based on file type.
        
        Args:
            file_content: File content as bytes
            file_extension: File extension (e.g., 'pdf', 'txt')
            
        Returns:
            Extracted text as a string
            
        Raises:
            ValueError: If file type is unsupported or extraction fails
        """
        file_extension = file_extension.lower().lstrip('.')
        
        if file_extension == 'pdf':
            return self.extract_text_from_pdf(file_content)
        elif file_extension == 'txt':
            return self.extract_text_from_txt(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}. Supported types: pdf, txt")
    
    def extract_entities(self, text: str) -> List[Dict]:
        """
        Extract named entities from text using the NER model.
        
        Args:
            text: Input text to process
            
        Returns:
            List of entity dictionaries with 'entity_group' and 'word' keys
        """
        if not text:
            return []
        
        try:
            # Limit text length to avoid token limits (BERT base has 512 token limit)
            # We'll process in chunks if needed
            max_length = 1000  # Approximate character limit for safety
            if len(text) > max_length:
                text = text[:max_length] + "..."
            
            entities = self.ner_pipeline(text)
            return entities if entities else []
        except Exception as e:
            raise RuntimeError(f"NER extraction failed: {str(e)}")
    
    def extract_dates(self, text: str) -> List[str]:
        """
        Extract dates from text using regex patterns.
        
        Supports various date formats:
        - MM/DD/YYYY, DD/MM/YYYY
        - Month DD, YYYY
        - YYYY-MM-DD
        - DD-MM-YYYY
        
        Args:
            text: Input text
            
        Returns:
            List of extracted date strings
        """
        date_patterns = [
            # MM/DD/YYYY or DD/MM/YYYY
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
            # Month DD, YYYY or DD Month YYYY
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',
            # YYYY-MM-DD
            r'\b\d{4}-\d{2}-\d{2}\b',
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_dates = []
        for date in dates:
            if date.lower() not in seen:
                seen.add(date.lower())
                unique_dates.append(date)
        
        return unique_dates
    
    def extract_emails(self, text: str) -> List[str]:
        """
        Extract email addresses from text using regex pattern.
        
        Args:
            text: Input text
            
        Returns:
            List of extracted email addresses
        """
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text, re.IGNORECASE)
        # Remove duplicates while preserving order
        seen = set()
        unique_emails = []
        for email in emails:
            email_lower = email.lower()
            if email_lower not in seen:
                seen.add(email_lower)
                unique_emails.append(email)
        return unique_emails
    
    def extract_phone_numbers(self, text: str) -> List[str]:
        """
        Extract phone numbers from text using regex patterns.
        
        Supports various formats:
        - (123) 456-7890
        - 123-456-7890
        - 123.456.7890
        - +1 123 456 7890
        - 1234567890
        - +91 12345 67890 (Indian format)
        
        Args:
            text: Input text
            
        Returns:
            List of extracted phone numbers
        """
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',  # General format
            r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # US format
            r'\+?\d{1,3}[-.\s]?\d{5}[-.\s]?\d{5}\b',  # Indian format
            r'\(\d{3}\)\s?\d{3}[-.]?\d{4}',  # (123) 456-7890
        ]
        
        phones = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            phones.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_phones = []
        for phone in phones:
            # Normalize phone number (remove spaces, keep formatting)
            normalized = re.sub(r'\s+', ' ', phone.strip())
            if normalized not in seen:
                seen.add(normalized)
                unique_phones.append(normalized)
        
        return unique_phones
    
    def extract_ids(self, text: str) -> List[str]:
        """
        Extract ID numbers (Aadhar, SSN, etc.) from text using regex patterns.
        
        Supports:
        - Aadhar (12 digits, may have spaces/dashes)
        - SSN (XXX-XX-XXXX)
        - PAN (Indian format)
        - Generic ID patterns
        
        Args:
            text: Input text
            
        Returns:
            List of extracted ID numbers
        """
        id_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN format XXX-XX-XXXX
            r'\b\d{4}\s?\d{4}\s?\d{4}\b',  # Aadhar format (12 digits with optional spaces)
            r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}\b',  # PAN format (Indian)
            r'\b[A-Z]{2}[A-Z0-9]{4}\d{4}[A-Z0-9]{1}\b',  # Generic ID pattern
            r'\b\d{12}\b',  # 12-digit ID (Aadhar without spaces)
        ]
        
        ids = []
        for pattern in id_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            ids.extend(matches)
        
        # Remove duplicates
        seen = set()
        unique_ids = []
        for id_num in ids:
            normalized = id_num.upper().strip()
            if normalized not in seen:
                seen.add(normalized)
                unique_ids.append(normalized)
        
        return unique_ids
    
    def extract_money_salary(self, text: str) -> List[str]:
        """
        Extract money amounts and salaries from text using regex patterns.
        
        Supports:
        - $123,456.78
        - USD 123,456
        - ₹50,000
        - 50000 INR
        - $50K, $50k
        - Salary ranges: $50,000 - $70,000
        
        Args:
            text: Input text
            
        Returns:
            List of extracted money/salary amounts
        """
        money_patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:K|k|M|m)?\b',  # $50,000 or $50K
            r'₹[\d,]+(?:\.\d{2})?(?:K|k|L|l|Cr|cr)?\b',  # ₹50,000 or ₹50K
            r'(?:USD|INR|EUR|GBP|JPY)\s?[\d,]+(?:\.\d{2})?(?:K|k|M|m)?\b',  # Currency codes
            r'[\d,]+(?:\.\d{2})?\s?(?:USD|INR|EUR|GBP|JPY|dollars?|rupees?)\b',  # Amount with currency
            r'(?:salary|pay|wage|income|compensation|CTC|package)[:\s]+[\$₹]?[\d,]+(?:\.\d{2})?(?:K|k|M|m|L|l)?',  # Salary context
            r'[\d,]+(?:\.\d{2})?\s?(?:per\s+)?(?:year|month|annum|annually|monthly)',  # Per year/month
        ]
        
        money = []
        for pattern in money_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            money.extend(matches)
        
        # Remove duplicates
        seen = set()
        unique_money = []
        for amount in money:
            normalized = amount.strip()
            if normalized.lower() not in seen:
                seen.add(normalized.lower())
                unique_money.append(normalized)
        
        return unique_money
    
    def extract_urls(self, text: str) -> List[str]:
        """
        Extract URLs from text using regex pattern.
        
        Args:
            text: Input text
            
        Returns:
            List of extracted URLs
        """
        url_pattern = r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w)*)?)?'
        urls = re.findall(url_pattern, text, re.IGNORECASE)
        
        # Also match www. URLs
        www_pattern = r'www\.(?:[-\w.])+(?:/(?:[\w/_.])*)?'
        www_urls = re.findall(www_pattern, text, re.IGNORECASE)
        urls.extend(['http://' + url for url in www_urls])
        
        # Remove duplicates
        seen = set()
        unique_urls = []
        for url in urls:
            url_lower = url.lower()
            if url_lower not in seen:
                seen.add(url_lower)
                unique_urls.append(url)
        
        return unique_urls
    
    def extract_file_numbers(self, text: str) -> List[str]:
        """
        Extract file numbers, case numbers, reference numbers from text.
        
        Supports:
        - File #12345
        - Case: ABC-123
        - Ref: 2024/001
        - Document ID: DOC-2024-001
        
        Args:
            text: Input text
            
        Returns:
            List of extracted file numbers
        """
        file_patterns = [
            r'(?:file|case|ref|reference|document|doc|id|number|no)[:\s#]+[A-Z0-9\-/]+',  # With prefix
            r'\b[A-Z]{2,}[-/]\d{4}[-/]\d{3,}\b',  # Format: ABC-2024-001
            r'\b\d{4}[/-]\d{3,}\b',  # Format: 2024/001
            r'\b[A-Z]{2,}\d{4,}\b',  # Format: ABC1234
        ]
        
        file_nums = []
        for pattern in file_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            file_nums.extend(matches)
        
        # Remove duplicates
        seen = set()
        unique_files = []
        for file_num in file_nums:
            normalized = file_num.strip()
            if normalized.upper() not in seen:
                seen.add(normalized.upper())
                unique_files.append(normalized)
        
        return unique_files
    
    def extract_percentages(self, text: str) -> List[str]:
        """
        Extract percentages from text using regex pattern.
        
        Supports:
        - 50%
        - 50 percent
        - 50.5%
        
        Args:
            text: Input text
            
        Returns:
            List of extracted percentages
        """
        percentage_patterns = [
            r'\b\d+(?:\.\d+)?%',  # 50% or 50.5%
            r'\b\d+(?:\.\d+)?\s+percent\b',  # 50 percent
        ]
        
        percentages = []
        for pattern in percentage_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            percentages.extend(matches)
        
        # Remove duplicates
        seen = set()
        unique_percentages = []
        for pct in percentages:
            normalized = pct.strip()
            if normalized.lower() not in seen:
                seen.add(normalized.lower())
                unique_percentages.append(normalized)
        
        return unique_percentages
    
    def extract_job_titles(self, text: str) -> List[str]:
        """
        Extract job titles from text using contextual patterns and keywords.
        
        Args:
            text: Input text
            
        Returns:
            List of extracted job titles
        """
        # Common job title patterns
        job_title_keywords = [
            r'\b(?:Senior|Junior|Lead|Principal|Chief|Executive|Associate|Assistant)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*',
            r'\b[A-Z][a-z]+\s+(?:Engineer|Developer|Manager|Director|Analyst|Specialist|Consultant|Architect|Designer|Officer|Coordinator|Administrator|Supervisor|Technician)',
            r'\b(?:Software|Data|Systems|Product|Project|Operations|Marketing|Sales|HR|Finance|IT)\s+[A-Z][a-z]+',
            r'\b(?:CEO|CTO|CFO|COO|VP|President|Manager|Director|Head|Lead)\b',
        ]
        
        job_titles = []
        for pattern in job_title_keywords:
            matches = re.findall(pattern, text)
            job_titles.extend(matches)
        
        # Also look for titles after "Position:", "Role:", "Title:", etc.
        context_patterns = [
            r'(?:position|role|title|designation|job)[:\s]+([A-Z][A-Za-z\s&]+)',
        ]
        for pattern in context_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            job_titles.extend(matches)
        
        # Remove duplicates and normalize
        seen = set()
        unique_titles = []
        for title in job_titles:
            normalized = ' '.join(title.split()).strip()
            if normalized and normalized.lower() not in seen:
                seen.add(normalized.lower())
                unique_titles.append(normalized)
        
        return unique_titles
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using domain-specific keywords and patterns.
        
        Args:
            text: Input text
            
        Returns:
            List of extracted skills
        """
        # Common technical and professional skills
        skill_keywords = [
            # Programming languages
            r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|SQL|HTML|CSS|R|Scala|Perl)\b',
            # Frameworks and tools
            r'\b(?:React|Angular|Vue|Node\.js|Django|Flask|Spring|Laravel|Express|TensorFlow|PyTorch|Keras|Pandas|NumPy)\b',
            # Cloud and DevOps
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|CI/CD|Terraform|Ansible)\b',
            # Databases
            r'\b(?:MySQL|PostgreSQL|MongoDB|Redis|Oracle|SQL Server|Cassandra|Elasticsearch)\b',
            # Other skills
            r'\b(?:Machine Learning|Deep Learning|Data Science|Big Data|Analytics|Agile|Scrum|DevOps|Microservices|REST API|GraphQL)\b',
        ]
        
        skills = []
        for pattern in skill_keywords:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend(matches)
        
        # Also look for skills in lists (after "Skills:", "Technical Skills:", etc.)
        context_patterns = [
            r'(?:skills?|technologies?|expertise|proficiency)[:\s]+([A-Za-z,\s&]+)',
        ]
        for pattern in context_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            # Split comma-separated skills
            for match in matches:
                skill_list = [s.strip() for s in match.split(',')]
                skills.extend(skill_list)
        
        # Remove duplicates and normalize
        seen = set()
        unique_skills = []
        for skill in skills:
            normalized = skill.strip()
            if normalized and len(normalized) > 1 and normalized.lower() not in seen:
                seen.add(normalized.lower())
                unique_skills.append(normalized)
        
        return unique_skills
    
    def extract_addresses(self, text: str) -> List[str]:
        """
        Extract addresses from text using multi-line pattern matching.
        
        Args:
            text: Input text
            
        Returns:
            List of extracted addresses
        """
        # Address patterns - look for street numbers, street names, cities, states, zip codes
        address_patterns = [
            # US format: 123 Main St, City, State ZIP
            r'\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?',
            # General format with postal code
            r'\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)[,\s]+[A-Za-z\s]+,\s*\d{5,}',
            # Indian format: Street, City, State PIN
            r'[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Colony|Nagar|Village)[,\s]+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*\d{6}',
            # Simple format with city and state
            r'\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd),\s*[A-Za-z\s]+,\s*[A-Z]{2}',
        ]
        
        addresses = []
        for pattern in address_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            addresses.extend(matches)
        
        # Also look for addresses after keywords
        context_keywords = ['address', 'location', 'residence', 'office', 'headquarters']
        for keyword in context_keywords:
            # Find text after keyword (up to 3 lines or 200 chars)
            pattern = rf'{keyword}[:\s]+([A-Za-z0-9\s,.-]{{10,200}})'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up the match
                cleaned = ' '.join(match.split())
                if len(cleaned) > 10 and any(char.isdigit() for char in cleaned):
                    addresses.append(cleaned)
        
        # Remove duplicates
        seen = set()
        unique_addresses = []
        for addr in addresses:
            normalized = ' '.join(addr.split()).strip()
            if normalized and normalized.lower() not in seen:
                seen.add(normalized.lower())
                unique_addresses.append(normalized)
        
        return unique_addresses
    
    def structure_entities(self, entities: List[Dict], dates: List[str], emails: List[str], 
                          phones: List[str], ids: List[str], money: List[str], urls: List[str],
                          file_numbers: List[str], percentages: List[str], job_titles: List[str],
                          skills: List[str], addresses: List[str]) -> Dict:
        """
        Structure extracted entities into a clean JSON format.
        
        Args:
            entities: List of entities from NER model
            dates: List of extracted dates
            emails: List of extracted email addresses
            phones: List of extracted phone numbers
            ids: List of extracted ID numbers
            money: List of extracted money/salary amounts
            urls: List of extracted URLs
            file_numbers: List of extracted file numbers
            percentages: List of extracted percentages
            job_titles: List of extracted job titles
            skills: List of extracted skills
            addresses: List of extracted addresses
            
        Returns:
            Dictionary with structured entity fields
        """
        result = {
            "name": [],
            "organization": [],
            "location": [],
            "dates": dates,
            "emails": emails,
            "phone_numbers": phones,
            "ids": ids,
            "money_salary": money,
            "urls": urls,
            "file_numbers": file_numbers,
            "percentages": percentages,
            "job_titles": job_titles,
            "skills": skills,
            "addresses": addresses
        }
        
        # Map NER labels to our output fields
        label_mapping = {
            "PER": "name",  # Person
            "PERSON": "name",
            "ORG": "organization",  # Organization
            "ORGANIZATION": "organization",
            "LOC": "location",  # Location
            "LOCATION": "location",
            "GPE": "location",  # Geopolitical entity
            "MISC": None,  # Miscellaneous (we'll skip this)
        }
        
        seen_entities = {
            "name": set(),
            "organization": set(),
            "location": set()
        }
        
        for entity in entities:
            entity_group = entity.get("entity_group", "").upper()
            word = entity.get("word", "").strip()
            
            # Map the entity group to our output field
            field_name = label_mapping.get(entity_group)
            
            if field_name and word:
                # Normalize the word (remove extra spaces, capitalize appropriately)
                normalized_word = " ".join(word.split())
                
                # Add to result if not duplicate
                if normalized_word not in seen_entities[field_name]:
                    seen_entities[field_name].add(normalized_word)
                    result[field_name].append(normalized_word)
        
        return result
    
    def extract(self, file_content: bytes, file_extension: str) -> Dict:
        """
        Main extraction method that processes a document and returns structured entities.
        
        Args:
            file_content: File content as bytes
            file_extension: File extension (e.g., 'pdf', 'txt')
            
        Returns:
            Dictionary with structured entity extraction results
            
        Raises:
            ValueError: If file processing fails
        """
        # Extract text from document
        text = self.extract_text(file_content, file_extension)
        
        # Extract entities using NER model
        entities = self.extract_entities(text)
        
        # Extract dates using regex
        dates = self.extract_dates(text)
        
        # Extract pattern-based entities
        emails = self.extract_emails(text)
        phones = self.extract_phone_numbers(text)
        ids = self.extract_ids(text)
        money = self.extract_money_salary(text)
        urls = self.extract_urls(text)
        file_numbers = self.extract_file_numbers(text)
        percentages = self.extract_percentages(text)
        
        # Extract contextual entities
        job_titles = self.extract_job_titles(text)
        skills = self.extract_skills(text)
        
        # Extract complex entities
        addresses = self.extract_addresses(text)
        
        # Structure the results
        structured_result = self.structure_entities(
            entities, dates, emails, phones, ids, money, urls,
            file_numbers, percentages, job_titles, skills, addresses
        )
        
        return structured_result


# Sample usage and examples:
"""
Example usage:

# Initialize extractor
extractor = DocumentExtractor()

# Example 1: Extract from PDF
with open("document.pdf", "rb") as f:
    pdf_content = f.read()
    result = extractor.extract(pdf_content, "pdf")
    print(result)

# Example 2: Extract from TXT
with open("document.txt", "rb") as f:
    txt_content = f.read()
    result = extractor.extract(txt_content, "txt")
    print(result)

# Expected output format:
{
    "name": ["John Doe", "Jane Smith"],
    "organization": ["Microsoft", "OpenAI"],
    "location": ["New York", "San Francisco", "USA"],
    "dates": ["2024-01-15", "March 15, 2024"]
}
"""