import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import clsx from "clsx";

// Definición del esquema de validación usando Zod
const loginSchema = z.object({
  email: z.string().email("Debe ser un correo válido"),
  password: z.string().min(1, "La contraseña es requerida")
});

export default function LoginPage() {
  const fetcher = useFetcher();
  const err = fetcher.data;
  console.log({ err });

  if (err?.message) {
    toast.error(err.message);
  }

  const [email, setEmail] = useState("jonarrodi99@gmail.com");
  const [password, setPassword] = useState("Ganondorf02@");
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Función para validar los campos usando Zod
  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({ email: "", password: "" });
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors = e.flatten().fieldErrors;
        setErrors({
          email: fieldErrors.email?.[0] || "",
          password: fieldErrors.password?.[0] || ""
        });
      }
      return false;
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      fetcher.submit(e.target, { method: "post", action: "/" });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg max-w-md mx-auto">
        <div className="px-6 py-4">
          <h2 className="text-gray-700 text-3xl font-semibold">Login</h2>
          <p className="mt-1 text-gray-600">Please login to your account.</p>
        </div>
        <div className="px-6 py-4">
          <fetcher.Form onSubmit={handleSubmit} method="post" action="/">
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className={clsx(
                  "mt-2 rounded w-full px-3 py-2 text-gray-700 bg-gray-200 outline-none focus:bg-gray-300",
                  { "border border-red-500": errors.email }
                )}
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={clsx(
                  "mt-2 rounded w-full px-3 py-2 text-gray-700 bg-gray-200 outline-none focus:bg-gray-300",
                  { "border border-red-500": errors.password }
                )}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div className="mt-6">
              <Button type="submit" className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 w-full">
                Iniciar sesión
              </Button>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
