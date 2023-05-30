// Helper function to construct date string - use in edit
 export function getDateValue(dateString) {
    if (!dateString) return ""; // Handle empty value
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
}
// Helper function to construct date string - use in show/index
export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
  
    return `${day}/${month}/${year}`;
}

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
  