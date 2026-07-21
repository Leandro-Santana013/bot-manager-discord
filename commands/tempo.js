const { SlashCommandBuilder } = require('discord.js');
const VoiceTracker = require('../modules/voice-tracker/VoiceTracker.js');
const CanvasRenderer = require('../modules/voice-tracker/CanvasRenderer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempo')
        .setDescription('Gera um perfil visual com suas estatísticas de tempo em call.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário para verificar o tempo (opcional)')
                .setRequired(false)),
                
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); 

        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        try {
            const stats = VoiceTracker.getUserStats(targetUser.id);
            const attachment = await CanvasRenderer.generateProfileCard(targetUser, stats);
            await interaction.editReply({ files: [attachment] });

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (e) {
                    console.error('[Comando Tempo] Não foi possível deletar a mensagem:', e.message);
                }
            }, 10000);
        } catch (error) {
            console.error('[Comando Tempo]', error);
            await interaction.editReply({ content: 'Houve um erro ao gerar o painel: ' + error.message });
        }
    },

    async executeMessage(message, args) {
        
        const replyMsg = await message.reply('Carregando perfil visual...');

        
        const targetUser = message.mentions.users.first() || message.author;
        
        try {
            const stats = VoiceTracker.getUserStats(targetUser.id);
            const attachment = await CanvasRenderer.generateProfileCard(targetUser, stats);
            
            
            await replyMsg.edit({ content: '', files: [attachment] });

            // Apaga a própria chamada "biz!tempo" se tiver permissão
            if (message.deletable) {
                message.delete().catch(() => {});
            }

            // Exclui a resposta com imagem depois de 5 segundos
            setTimeout(async () => {
                try {
                    await replyMsg.delete();
                } catch (e) {
                    console.error('[Comando Tempo] Não foi possível deletar a mensagem de prefixo:', e.message);
                }
            }, 5000);
        } catch (error) {
            console.error('[Comando Tempo]', error);
            await replyMsg.edit({ content: 'Houve um erro ao gerar o painel: ' + error.message });
        }
    }
};
