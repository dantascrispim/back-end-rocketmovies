
const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage")


class UserAvatarController {
    async update(request, response) {
        const user_id = request.user.id;
        const avatarFilename = request.file.filename;

        const diskStorage = new DiskStorage();

        const user = await knex ("users")
            .where({ id: user_id }).first();

            // caso o usuário não exista...
            if(!user) {
                throw new AppError ("Somente Usarios autenticados podem mudar o avatar", 401);
            }
            
            // caso o usuário ja possu um avatar

            if(user.avatar){ 
                await diskStorage.deleteFile(user.avatar);
            }

            const filename = await diskStorage.saveFile(avatarFilename);

            // inserir um anova foto no avatar
            user.avatar = filename;

            // ele buscar pelo ID na tabela "users" e faz a atualização do avatar...
            await knex ("users").update(user).where({ id: user_id });

            return response.json(user);
    }
}


module.exports = UserAvatarController;