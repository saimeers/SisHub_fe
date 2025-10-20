import { useCallback } from 'react';
import { userSchema } from '../../../../utils/userSchema';
import { ZodError } from 'zod';

export const useUserValidation = () => {
  const validateUser = useCallback((user) => {
    try {
      userSchema.parse(user);
      return []; 
    } catch (err) {
      if (err instanceof ZodError) {
        return err.issues.map(e => `${e.path[0]}: ${e.message}`);
      }
      console.error(err);
      return ["Error desconocido al validar el usuario"];
    }
  }, []);

  const checkDuplicates = useCallback((user, users, excludeIndex = null) => {
    const duplicates = [];

    users.forEach((existingUser, index) => {
      if (excludeIndex !== null && index === excludeIndex) return;

      if (existingUser.codigo === user.codigo) {
        duplicates.push(`código ${user.codigo}`);
      }
      if (existingUser.documento === user.documento) {
        duplicates.push(`documento ${user.documento}`);
      }
      if (existingUser.correo.toLowerCase() === user.correo.toLowerCase()) {
        duplicates.push(`correo ${user.correo}`);
      }
    });

    return [...new Set(duplicates)];
  }, []);

  return { validateUser, checkDuplicates };
};