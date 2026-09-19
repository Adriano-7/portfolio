# Customer Health Insurance Prediction - ICD 24/25

> **Project**
> <br />
> Course Unit: [Introdução à Ciência de Dados](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=543588) (Introduction to Data Science), 4th year
> <br />
> Course: **MIA** (Faculty of Engineering/Science of the University of Porto)
> <br />
> Faculty: **FCUP / FEUP**
> <br />
> Project evaluation: **20**/20

---

## Project Overview

The objective of this project was to develop a machine learning pipeline to predict whether a customer has health insurance based on a diverse set of demographic and financial features. The project involved handling a large-scale real-world dataset (~72k records) characterized by high class imbalance and missing data.

## Technical Approach

### 1. Exploratory Data Analysis & Profiling
Using **YData Profiling** and manual statistical analysis, we identified critical insights:
- **Feature Redundancy:** Discovered a correlation of 1.0 between `state_of_res` and `code_column`, allowing for dimensionality reduction.
- **Inconsistencies:** Found "working" individuals aged 0 and 100+, which were treated as outliers and re-imputed using **KNN Imputer**.
- **Target Leakage Check:** Analyzed categorical correlations using **Cramér's V** to ensure no single feature was unfairly "spoiling" the target.

### 2. Data Preprocessing Pipeline
- **Numerical Scaling:** Applied **Log Normalization** to `income` and `gas_usage` to mitigate the impact of heavy right-skewed outliers.
- **Feature Engineering:** Implemented a combination of **One-Hot Encoding** for multi-class variables (e.g., marital status) and **Label Encoding** for binary flags.
- **Imputation:** Used a **KNN Imputer** ($k=5$, weighted by distance) to fill gaps in features like `num_vehicles` and `recent_move_b`.

### 3. Addressing Data Imbalance
Initial models were biased toward the majority class (90%+ accuracy but ~0% specificity). We experimented with several state-of-the-art resampling methods:
- **Borderline-SMOTE** & **ADASYN**
- **SMOTE-ENN** (Edited Nearest Neighbors)
- **SVM-SMOTE**
- **SMOTE-Tomek Links**

Using the **Problexity** library, we evaluated these datasets. **SVM-SMOTE** was selected as the best performer, successfully balancing the classes while maintaining high class separability (F1) and minimizing feature overlap (F2).

### 4. Model Selection & Optimization
We conducted an extensive benchmark of 8 different paradigms, utilizing **GridSearchCV** for hyperparameter tuning:

| Model | Accuracy | F1-Score | Specificity |
| :--- | :--- | :--- | :--- |
| **Random Forest** | **0.935** | **0.936** | **0.930** |
| XGBoost | 0.914 | 0.915 | 0.903 |
| KNN ($k=5$) | 0.890 | 0.882 | 0.963 |
| MLP (Neural Net) | 0.827 | 0.824 | 0.847 |
| Logistic Regression| 0.801 | 0.800 | 0.806 |

<img width="989" height="590" alt="image" src="https://github.com/user-attachments/assets/b9ee255f-bc40-4f00-9f0b-5191c115af10" />


The **Random Forest (100 estimators)** was chosen as our final model due to its superior ability to generalize across both the majority and minority classes.

## Project Structure

```text
└── adriano-7-fcup-icd-project/
    ├── data/                       # Dataset files (customer.csv, etc.)
    ├── src/
    │   ├── main.ipynb              # Full project pipeline (EDA to Prediction)
    │   ├── predict.ipynb           # Optimized script for final inference
    │   ├── data_profiling/         # Detailed initial data reports
    │   ├── data_imbalance/         # Experiments with SMOTE variations
    │   └── data_complexity/        # Problexity metrics analysis
    └── docs/                       # Styles and MathJax for notebook rendering
```

## How to Run

1. **Install Dependencies:**
   ```bash
   pip install pandas numpy seaborn matplotlib sklearn imbalanced-learn problexity ydata-profiling xgboost
   ```
2. **Execute the Pipeline:**
   Open `src/main.ipynb` in Jupyter to view the full step-by-step analysis, or run `src/predict.ipynb` to generate the `predictions.csv` file directly from the raw data.

## Conclusions
- **Context over Metrics:** High accuracy is meaningless in imbalanced datasets; **Specificity** and **Confusion Matrices** were the true guides for this project.
- **Synthetic Data:** SMOTE-based techniques are essential for insurance-related datasets where the "uninsured" event is rare but critical to predict.
- **Model Efficiency:** While Neural Networks and XGBoost performed well, a properly tuned **Random Forest** provided the most stable and high-performing results for this specific feature space.

## Group S Members
- **Adriano Machado** ([up202105352@up.pt](mailto:up202105352@up.pt))
- **David Pinto** ([up201704300@up.pt](mailto:up201704300@up.pt))
- **Francisco Ana** ([up202108762@up.pt](mailto:up202108762@up.pt))
