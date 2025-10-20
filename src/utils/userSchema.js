// userSchema.js
import { z } from 'zod';

export const userSchema = z.object({
    codigo: z
        .string()
        .regex(/^\d{7}$/, "El código debe ser numérico y de 7 dígitos"),
    nombre: z
        .string()
        .min(3, "El nombre debe tener mínimo 3 caracteres"),
    documento: z
        .string()
        .regex(/^\d{6,10}$/, "El documento debe tener entre 6 y 10 dígitos"),
    correo: z
        .string()
        .refine((val) => val.endsWith('@ufps.edu.co'), {
            message: 'El correo debe ser @ufps.edu.co',
        }),
    telefono: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{7,10}$/.test(val), {
            message: "Teléfono inválido (7-10 dígitos)",
        }),
});
