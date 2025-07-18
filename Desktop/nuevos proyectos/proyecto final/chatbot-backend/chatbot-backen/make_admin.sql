-- Cambiar usuario con email admin123@example.com a rol admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin123@example.com';

-- Verificar el cambio
SELECT id, username, email, role 
FROM users 
WHERE email = 'admin123@example.com';
