const { hash, compare } = require("bcryptjs");  
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;
        
        const database = await sqliteConnection();
        const checkUserExists = await database.get("select * from users WHERE email = (?)", [email])

        if(checkUserExists){
            throw new AppError("Já existe uma conta com esse email.");
        }

        const hashedPassword = await hash(password, 8);  // fator de complexidade da criptografia -->

        await database.run(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
             [ name, email, hashedPassword ]
             );

        return response.status(201).json();
    }

    async update(request, response) {
        
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);

        if(!user){
            throw new AppError("Usuário não encontrado.");
        }

        const userWithUpdateEmail = await database.get("SELECT * FROM users WHERE email = (?) ", [email]);

        if(userWithUpdateEmail && userWithUpdateEmail.id !== user.id){
            throw new AppError("Já existe uma conta com esse email.");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;


        if(password  &&  !old_password){
            throw new AppError("Você precisa informa a senha antiga para definir a nova senha.");
        }
        if(password && old_password){

            const checkoldPassword = await compare(old_password, user.password);
            if(!checkoldPassword) {

                throw new AppError("Senha antiga incorreta.");
            }

            user.password = await hash(password, 8);
        }

        await database.run(`
        UPDATE users SET 
        name = ?, 
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?
        `,
        [user.name, user.email, user.password, user_id]
        );

        return response.json();
    }

}

module.exports = UsersController;



//METODOS ULTILIZADOS -->

/*
    - index - GET para listar vários registros.
    - show - GET para exibri um registro especifico.
    - create - POST para criar um registro.
    - delete - DELETE para remover um registro.
 */