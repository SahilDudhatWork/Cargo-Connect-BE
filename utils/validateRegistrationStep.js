const validateUserData = (data) => {
  let stepCompleted = true;

  const isNullOrEmpty = (value) =>
    value === null || value === undefined || value === "";

  // Check for null/empty in the main fields
  const mainFields = [
    "companyName",
    "contactName",
    "contactNumber",
    "email",
    "password",
  ];
  for (const field of mainFields) {
    if (isNullOrEmpty(data[field])) {
      stepCompleted = false;
      break;
    }
  }

  // Check commercial references
  if (data.commercialReference && Array.isArray(data.commercialReference)) {
    for (const reference of data.commercialReference) {
      const referenceFields = [
        "companyName",
        "contactName",
        "emailAddress",
        "contactNo",
      ];
      for (const refField of referenceFields) {
        if (isNullOrEmpty(reference[refField])) {
          stepCompleted = false;
          break;
        }
      }
      if (!stepCompleted) break;
    }
  }
  // Check company formation based on companyFormationType
  const formationType = data.companyFormationType || null;
  if (formationType === "USA") {
    const usaFields = ["w9_Form", "utility_Bill"];
    for (const field of usaFields) {
      if (isNullOrEmpty(data.companyFormation.usa[field])) {
        stepCompleted = false;
        break;
      }
    }
  } else if (formationType === "MEXICO") {
    const maxicoFields = [
      "copia_Rfc_Form",
      "constance_Of_Fiscal_Situation",
      "proof_of_Favorable",
      "proof_Of_Address",
    ];
    for (const field of maxicoFields) {
      if (isNullOrEmpty(data.companyFormation.maxico[field])) {
        stepCompleted = false;
        break;
      }
    }
  }

  // Return a boolean value directly
  return stepCompleted;
};

const validateCarrierData = (data) => {
  let stepCompleted = true;

  const isNullOrEmpty = (value) =>
    value === null || value === undefined || value === "";

  // Check for null/empty in the main fields
  const mainFields = [
    "companyName",
    "contactName",
    "contactNumber",
    "email",
    "password",
    "scac",
    "caat",
    "insurancePolicy",
    "oea",
    "ctpat",
  ];
  for (const field of mainFields) {
    if (isNullOrEmpty(data[field])) {
      stepCompleted = false;
      break;
    }
  }

  // Check commercial references
  if (data.commercialReference && Array.isArray(data.commercialReference)) {
    for (const reference of data.commercialReference) {
      const referenceFields = [
        "companyName",
        "contactName",
        "emailAddress",
        "contactNo",
      ];
      for (const refField of referenceFields) {
        if (isNullOrEmpty(reference[refField])) {
          stepCompleted = false;
          break;
        }
      }
      if (!stepCompleted) break;
    }
  }
  // Check company formation based on companyFormationType
  const formationType = data.companyFormationType;
  if (formationType === "USA") {
    const usaFields = ["w9_Form", "utility_Bill"];
    for (const field of usaFields) {
      if (isNullOrEmpty(data.companyFormation.usa[field])) {
        stepCompleted = false;
        break;
      }
    }
  } else if (formationType === "MEXICO") {
    const maxicoFields = [
      "copia_Rfc_Form",
      "constance_Of_Fiscal_Situation",
      "proof_of_Favorable",
      "proof_Of_Address",
    ];
    for (const field of maxicoFields) {
      if (isNullOrEmpty(data.companyFormation.maxico[field])) {
        stepCompleted = false;
        break;
      }
    }
  }
  return stepCompleted;
};

module.exports = { validateCarrierData, validateUserData };
