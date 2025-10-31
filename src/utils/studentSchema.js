import { z } from 'zod';

export const studentSchema = z.object({
    grupo_identificador: z
        .string()
        .regex(/^\d{7}-[A-Z]-\d{2}-\d{4}$/, 'Grupo inválido (formato: 1154306-B-02-2025)'),
    codigo: z
        .string()
        .regex(/^\d{7}$/, 'El código debe ser numérico y de 7 dígitos'),
    nombre: z
        .string()
        .min(3, 'Nombre inválido (mínimo 3 caracteres)'),
    documento: z
        .string()
        .regex(/^\d{6,10}$/, 'Documento inválido (6-10 dígitos numéricos)'),
    correo: z
        .string()
        .refine((val) => val.endsWith('@ufps.edu.co'), {
            message: 'El correo debe ser @ufps.edu.co',
        }),
    telefono: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{7,10}$/.test(val), {
            message: 'Teléfono inválido (7-10 dígitos)',
        }),
});
