const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('Apaga mensagens do chat atual.')
        .addIntegerOption(option => 
            option.setName('quantidade')
                .setDescription('Quantas mensagens apagar (se não informar nada, apagará o canal inteiro!)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), 

    async execute(interaction) {
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ Você não tem permissão para gerenciar mensagens.', ephemeral: true });
        }

        const quantidade = interaction.options.getInteger('quantidade');
        const channel = interaction.channel;

        
        if (!quantidade) {
            await interaction.reply({ content: '⚠️ Iniciando o protocolo de limpeza total (Nuke) no canal...', ephemeral: true });
            
            try {
                const posicao = channel.position;
                
                
                const novoCanal = await channel.clone({
                    position: posicao
                });
                
                
                await channel.delete();
                
                
                await novoCanal.send('🧹 **Chat limpo com sucesso!** Todas as mensagens anteriores foram apagadas.');
            } catch (error) {
                console.error('[Nuke Error]', error);
                
                await interaction.followUp({ content: 'Houve um erro ao tentar limpar totalmente o canal. Verifique as permissões do bot.', ephemeral: true });
            }
            return;
        }

        
        if (quantidade < 1 || quantidade > 100) {
            return interaction.reply({ content: '❌ Por favor, informe um número entre 1 e 100, ou deixe em branco para apagar tudo.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const deleted = await channel.bulkDelete(quantidade, true);
            await interaction.editReply({ content: `✅ Limpeza concluída! Foram apagadas **${deleted.size}** mensagens.` });
        } catch (error) {
            console.error('[Comando Limpar]', error);
            await interaction.editReply({ content: 'Houve um erro ao apagar as mensagens. Lembre-se que o Discord não permite apagar mensagens com mais de 14 dias em massa.' });
        }
    },

    async executeMessage(message, args) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Você não tem permissão para gerenciar mensagens.');
        }

        const channel = message.channel;
        const quantidadeArg = args[0];

        
        if (!quantidadeArg || isNaN(quantidadeArg)) {
            try {
                const posicao = channel.position;
                
                
                const novoCanal = await channel.clone({
                    position: posicao
                });
                
                
                await channel.delete();
                
                
                await novoCanal.send('🧹 **Chat limpo com sucesso!** Todas as mensagens anteriores foram apagadas.');
            } catch (error) {
                console.error('[Nuke Error]', error);
                await message.reply('Houve um erro ao tentar limpar totalmente o canal. Verifique as permissões do bot.');
            }
            return;
        }

        const quantidade = parseInt(quantidadeArg);

        if (quantidade < 1 || quantidade > 100) {
            return message.reply('❌ Por favor, informe um número entre 1 e 100 (Exemplo: `biz!limpar 50`), ou deixe vazio (`biz!limpar`) para apagar tudo.');
        }

        try {
            
            if (message.deletable) {
                await message.delete().catch(() => {});
            }

            const deleted = await channel.bulkDelete(quantidade, true);
            
            const replyMsg = await channel.send(`✅ Limpeza concluída! Foram apagadas **${deleted.size}** mensagens.`);
            
            
            setTimeout(() => {
                replyMsg.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('[Comando Limpar]', error);
            await message.reply('Houve um erro ao apagar as mensagens. Lembre-se que o Discord não permite apagar mensagens com mais de 14 dias em massa.');
        }
    }
};
