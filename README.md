## ACCESS THE MONGODB

to start the container
`docker compose up` 

to access the container 
`docker exec -it ${dockerId} /bin/bash`


Domain:
  users
  tasks
  payments


Onde ao criar conta vai enviar o email
Quando está a criar uma conta que já existe, tem de voltar no local onde ele parou? Por pensar ainda

### ------------------------------RBAC Shor Doc-------------------------------------------

# 🛡️ NestJS RBAC System

This code added in this PR for  **Role-Based Access Control (RBAC)** system in a NestJS API for three user types: `Client`, `ServiceProvider`, and `SuperAdmin`.


## 🔐 Roles & Permissions

- `SuperAdmin`: Full access
- `ServiceProvider`: Can have restricted access
- `Client`: Can have restricted access

### 🔒 Protected Endpoints

| Method | Endpoint                                | Access                                                           |
|--------|-----------------------------------------|------------------------------------------------------------------|
| GET    | /tasks/:id                              | Authenticated User ( SuperAdmin and Task Owner/Client )          |
| GET    | /service-providers                      | Any Authenticated User ( SuperAdmin | Client |ServiceProvder )   |
| GET    | /service-providers/bookings             | Authenticated User (Service Provider )                           |

### 🛡️ How It Works

- `Role.enum.ts` Roles enum (added)
- `@Roles()` decorator to restrict access (added)
- `RolesGuard` enforces route-level role checks (added)
- `AuthGuard('jwt')` for authentication (existing )
- 403 responses for unauthorized/forbiden users
- fetch-task.ts service (added)
- get-single-task.ts  controller (added)

### 🧪 Testing

Use Swagger UI:

- Test access 
- For convinience and testing first make all three accounts of superadmin, client and service provider from respective register apis. And then login one by one, put the given accesscode in authentication and you will be able to test.
- Api#1, /tasks/:id    --Returns tasks data of given task id only if that task belongs to the user logged in (Client). OR to super admin
- Api#2, /service-providers   --//the logic is just that it returns users data to all authenticated users. 
- Api#3, /user/service-providers/bookings  --This returns data of current service provider logged in, and solely for service providers' role as per understading.