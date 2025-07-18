-- Agregar columna role a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Actualizar usuarios existentes para que tengan rol 'user' por defecto
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Crear un usuario admin de ejemplo (opcional)
-- UPDATE users SET role = 'admin' WHERE id = 1;
