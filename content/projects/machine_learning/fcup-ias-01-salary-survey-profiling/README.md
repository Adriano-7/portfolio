# Salary Survey Data Profiling

> **Project**
> <br />
> Course Unit: [Inteligência Artificial e Sociedade](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542585), 4th year
> <br />
> Course: **M.IA** (Masters in Artificial Intelligence)
> <br />
> Faculty: **FCUP/FEUP** (University of Porto)
> <br />
> Report: [Data Profiling of a Salary Survey](./report.pdf)
> <br />
> Project evaluation: **20**/20

---

## Project Goals

This project performs a **data profiling** and quality assessment of a large-scale salary survey dataset (over 28,000 records). The objective was to identify structural weaknesses, data inconsistencies, and demographic biases that could compromise the integrity of subsequent AI models or statistical analyses.

**Objectives:**
- **Metadata Analysis:** Assessing the schema, data types, and completeness of the 18-variable dataset.
- **Data Cleaning:** Developing strategies to normalize open-text responses for geographic and monetary fields.
- **Association Discovery:** Using statistical methods to identify hidden relationships between professional and demographic variables.
- **Bias Identification:** Quantifying imbalances in gender, race, and geography to ensure fair analysis.

## Technical Approach

### 1. Data Structure & Quality Assessment
The initial phase involved a systematic audit of the dataset's integrity. We identified that 17.2% of the data was missing, primarily in optional contextual fields. 

- **Country Standardization:** The "United States" alone was written in over 10 different formats (USA, U.S., US, etc.). By implementing a normalization script, we corrected the US entry count from **9,337 to 23,039**, proving that raw data significantly underrepresented the primary demographic.
- **Salary Formatting:** We developed a preprocessing pipeline to handle inconsistent thousand-separators (commas vs. periods) to allow for numerical conversion and outlier detection.

### 2. Relationship Analysis (Cramér’s V)
To understand how categorical variables interact, we implemented a **Cramér’s V association matrix**. Unlike standard Pearson correlation, this allowed us to measure the strength of association between non-numeric features.
<img width="911" height="684" alt="image" src="https://github.com/user-attachments/assets/5bee118a-62ca-4472-8d3e-5a10ae763ecf" />

**Findings:**
*   **Strong Links:** High association between *Currency & Country* (0.90) and *Currency & City* (0.83).
*   **Professional Alignment:** Moderate correlation between *Total Experience & Field Experience* (0.53).
*   **Demographic Independence:** Most demographic variables (gender, race) showed weak correlations with professional titles, suggesting that salary disparities found in such data are often driven by external systemic factors rather than simple variable overlap.

### 3. Demographic & Geographic Bias Analysis
A major component of the project was visualizing and documenting the representational imbalances that lead to algorithmic bias:
- **Gender Imbalance:** The dataset features a 4:1 ratio of women to men, which is unusual for tech-heavy surveys and requires weighted sampling for any fair predictive model.
- **Racial Skew:** Approximately 80% of respondents identified as White, with significantly lower representation for Black, Middle Eastern, and Native American groups.
- **Western Centricity:** The data is overwhelmingly US-centric (22,000+ entries), meaning models trained on this data would likely fail to generalize to European or Asian labor markets.

## Running the analysis

**Setup:**
```bash
git clone https://github.com/Adriano-7/salary-survey-profiling
cd salary-survey-profiling
```

**Run the Profiling:**
```bash
# Open the Jupyter Notebook to see the full cleaning and analysis process
jupyter notebook T01_Assignment_Notebook.ipynb
```

## Tech stack

Python, Pandas, NumPy, Ydata-Profiling (formerly Pandas-Profiling), Matplotlib, Seaborn, Scipy (Stats)

## Author

- **Adriano Machado** (up202105352)
