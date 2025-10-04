export const formatShortName = (fullName) => {
  if (!fullName) return "Usuario";

  const capitalize = (text) => {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formattedName = capitalize(fullName.trim());
  const parts = formattedName.split(" ");

  if (parts.length <= 2) return formattedName;

  return `${parts[0]} ${parts[2] || parts[1]}`;
};


export const getFirstName = (fullName) => {
  if (!fullName) return "Usuario";

  const firstName = fullName.trim().split(" ")[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

export const getInitials = (fullName) => {
  if (!fullName) return "U";

  const parts = fullName.trim().split(" ");
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = (parts[2] || parts[1]).charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}`;
};

export const formatRole = (role) => {
  if (!role) return "Rol";

  return role
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};