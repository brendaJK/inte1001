
import { ActionFunction, json, redirect, } from "react-router-dom";
import { BadgesService } from "../service";
import { z } from "zod";

const badgeSchema = z.object({
  id: z.number().optional(),
  name: z.string({
    message: "El nombre debe ser una cadena de texto",
  }).min(1, { message: "El nombre es obligatorio" }),

  pointsRequired: z.number({ 
    message: "Los puntos requeridos deben ser un número" })
    .min(1, { message: "Los puntos requeridos son obligatorios y/o deben ser positivos" }),

  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  
  image: z.any({
    message: "La imagen es obligatoria",
  })
  .refine((value) => value instanceof File, { message: "La imagen debe ser un archivo válido" }) 
  .refine((value) => value == null && value == undefined, { message: "La imagen es obligatoria" }) 
  .refine((file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }, { message: "Solo se permiten archivos PNG, JPEG o JPG" })

});

const badgeUpdateSchema = z.object({
  id: z.number().optional(),
  name: z.string({
    message: "El nombre debe ser una cadena de texto",
  }).min(1, { message: "El nombre es obligatorio" }),

  pointsRequired: z.number({
    message: "Los puntos requeridos deben ser un número"
  })
  .min(1, { message: "Los puntos requeridos son obligatorios y/o deben ser positivos" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),

  // Si no se envía una imagen, se permite que sea nula. Si se envía, se valida que sea un archivo válido
  image: z.any({
    message: "La imagen es obligatoria",
  })
  .optional()
  .refine((value) => value instanceof File, { message: "La imagen debe ser un archivo válido" })
  .refine((value) => value == null && value == undefined, { message: "La imagen es obligatoria" })
  .refine((file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }, { message: "Solo se permiten archivos PNG, JPEG o JPG" })
  
});



  export const ActionBadgesDelete: ActionFunction = async ({ params }) => {
    console.log(params);
    const id = params.id as string;
    const service = new BadgesService();
    console.log(`id ${id}`);
    await service.deleteBadges(Number(id));
    return window.location.reload();
  }

  export const ActionBadgesUpdate: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();

    //si image esta vacio, se elimina del formData
    if (!formData.get("image")) {
      console.log(formData.get("image"), "image");
      formData.delete("image");
    }
  
    const formFields = {
      name: String(formData.get("name")),
      pointsRequired: Number(formData.get("pointsRequired")),
      description: String(formData.get("description")),
      image: formData.get("image"),
    };
  
    const validation = badgeUpdateSchema.safeParse(formFields);
    if (!validation.success) {
      console.log("Errores de validación", validation.error.format());
      const errors = validation.error.format();
      return json({ error: errors }, { status: 400 });
    }
  
    const service = new BadgesService();
    const result = await service.updateBadges(formData, Number(params.id));
  
    if ('success' in result && !result.success) {
      console.log(result.error, "error");
      return json({ error: result.error }, { status: 400 });
    }
  
    return redirect("/badges");
  };
  

  export const ActionBadgesCreate: ActionFunction = async ({ request }) => {
    
    const formData = await request.formData();
    
    // Extraer los datos del formulario
    const formFields = {
      name: String(formData.get("name")),
      pointsRequired: Number(formData.get("pointsRequired")),
      description: String(formData.get("description")),
      image: formData.get("image"),
    };

    //Validar que hay imagen en el formData si no que pida una
    if (!formFields.image) {
      return json({ error: "La imagen es obligatoria" }, { status: 400 });
    }

    const validation = badgeSchema.safeParse(formFields);
    
    if (!validation.success) {
      // Si hay errores, devuelve el objeto de errores a la interfaz
      console.log("Errores de validación", validation.error.format());
      const errors = validation.error.format();
      return errors;
    }    

    const service = new BadgesService();
    await service.createBadges(formData);
    return redirect("/badges");
  };
  