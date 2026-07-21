require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages,    
        GatewayIntentBits.MessageContent    
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
    }
}


client.once('ready', () => {
    console.log(`Logado como ${client.user.tag}! Banco de dados carregado e rastreando tempo de call.`);
    
    
    const VoiceTracker = require('./modules/voice-tracker/VoiceTracker.js');
    for (const guild of client.guilds.cache.values()) {
        for (const voiceState of guild.voiceStates.cache.values()) {
            if (voiceState.channelId && !voiceState.member?.user.bot) {
                if (!VoiceTracker.activeJoins.has(voiceState.id)) {
                    VoiceTracker.activeJoins.set(voiceState.id, Date.now());
                }
            }
        }
    }

    
    const FechamentoAutomatico = require('./cron/FechamentoAutomatico.js');
    FechamentoAutomatico.iniciar(client);
});


const interactionHandler = require('./events/interactionHandler.js');


client.on('interactionCreate', async interaction => {
    
    if (!interaction.isChatInputCommand()) {
        try {
            await interactionHandler.handleInteraction(interaction);
        } catch (e) {
            console.error('[InteractionHandler Erro]', e);
        }
        return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[Erro no comando ${interaction.commandName}]`, error);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
            }
        } catch (replyError) {
            console.error('[Falha ao enviar mensagem de erro]', replyError.message);
        }
    }
});


client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = 'biz!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    
    const cmdName = commandName;
    const command = client.commands.get(cmdName);
    
    if (!command) return;

    try {
        if (typeof command.executeMessage === 'function') {
            await command.executeMessage(message, args);
        } else {
            message.reply('Este comando não suporta prefixos ainda.');
        }
    } catch (error) {
        console.error(error);
        await message.reply('Houve um erro ao executar este comando por texto!');
    }
});


const voiceStateUpdate = require('./events/voiceStateUpdate.js');
client.on(voiceStateUpdate.name, (...args) => voiceStateUpdate.execute(...args));


client.login(process.env.DISCORD_TOKEN);
