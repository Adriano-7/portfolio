# Fetal Health Classification: Addressing Class Imbalance

> **Project**
> <br />
> Course Unit: [Inteligência Artificial e Sociedade](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=542585), 4th year
> <br />
> Course: **M.IA** (Masters in Artificial Intelligence)
> <br />
> Faculty: **FCUP/FEUP** (University of Porto)
> <br />
> Report: [Individual Assignment 3: Imbalanced Data](./report.pdf)
> <br />
> Project evaluation: **20**/20

---

## Project Goals

The objective of this study was to investigate the challenges associated with class imbalance in the **Fetal Health Classification** dataset. In clinical settings, failing to identify a "Pathological" or "Suspect" case (False Negative) is significantly more severe than misclassifying a "Normal" case. This project focuses on optimizing **Recall** and **F1-Score** for minority classes.

- **Data Profiling:** Identifying imbalance ratios (Normal cases are 9.4x more frequent than Pathological cases).
- **Resampling Evaluation:** Testing multiple data-level techniques including **SMOTE**, **BorderlineSMOTE**, **ADASYN**, and **SMOTETomek**.
- **Model Optimization:** Comparing **Logistic Regression**, **Random Forest**, and **Gradient Boosting**, culminating in a **Hard-Voting Ensemble** model.

## Technical Approach

### 1. Exploratory Data Analysis (EDA)
The dataset consists of 2,126 Cardiotocogram (CTG) measurements. 
*   **Target Imbalance:** 77.8% Normal, 13.9% Suspect, and 8.3% Pathological.
*   **Feature Correlation:** Analysis revealed that `prolonged_decelerations` and `abnormal_short_term_variability` are the strongest predictors of fetal distress.
*   **Visualizing Boundaries:** Used **PCA (Principal Component Analysis)** to visualize class overlap before and after resampling.

### 2. Addressing Imbalance (Resampling)
We prioritized data-level interventions to "level the playing field" for the minority classes.
*   **Top Performer:** **BorderlineSMOTE** proved most effective, as it generates synthetic samples near the decision boundaries where misclassification is most likely.
*   **Impact:** As shown in the PCA plots below, SMOTETomek and BorderlineSMOTE significantly clarified the decision boundaries between "Suspect" and "Pathological" classes.

![PCA Comparison](docs/pca.png)

### 3. Model Performance & Ensembling
While a baseline Logistic Regression achieved 89% weighted accuracy, it suffered from poor recall (66%) on Suspect cases. By implementing a **Gradient Boosting Classifier** with **BorderlineSMOTE**, we achieved a recall of **0.91 for Suspect** and **1.00 for Pathological** cases.

| Model | Dataset | Recall (Suspect) | Recall (Pathological) | F1-Score (Avg) |
| :--- | :--- | :--- | :--- | :--- |
| **Ensemble (Hard Voting)** | **BorderlineSMOTE** | **94%** | **100%** | **94%** |
| **Gradient Boosting** | BorderlineSMOTE | 91% | 100% | 92% |
| **Logistic Regression** | Imbalanced (Base) | 66% | 76% | 79% |

## Running the code

**Setup:**
```bash
# It is recommended to use a virtual environment
pip install pandas numpy matplotlib seaborn scikit-learn imbalanced-learn
```

**Run Analysis:**
The complete pipeline from data profiling to ensemble training is available in the Jupyter Notebook:
```bash
jupyter notebook IA03_Data_Imbalace.ipynb
```

## Tech Stack

Python, Scikit-learn, Imbalanced-learn (imblearn), Pandas, Seaborn, Matplotlib

## Author

- **Adriano Machado** (up202105352@up.pt) - Faculty of Sciences, University of Porto