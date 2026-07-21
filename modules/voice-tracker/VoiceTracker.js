const db = require('./DatabaseManager');
const TicketDatabase = require('../tickets/TicketDatabase.js');

class VoiceTracker {
    constructor() {
        this.activeJoins = new Map();
    }

        handleVoiceStateUpdate(oldState, newState) {
        const userId = newState.id || oldState.id;
        
        if (newState.member?.user.bot || oldState.member?.user.bot) return;

        
        if (!oldState.channelId && newState.channelId) {
            this.activeJoins.set(userId, Date.now());
        }

        
        if (oldState.channelId && !newState.channelId) {
            const joinedAt = this.activeJoins.get(userId);
            
            if (joinedAt) {
                const timeSpent = Date.now() - joinedAt;
                
                try {
                    db.updateUserTime(userId, timeSpent);
                    
                    
                    if (oldState.member) {
                        this.verificarPromocaoAutomatica(oldState.member, userId);
                    }
                } catch (error) {
                    console.error(`[VoiceTracker] Erro ao salvar no banco:`, error);
                }
                
                this.activeJoins.delete(userId);
            }
        }
    }

    async verificarPromocaoAutomatica(member, userId) {
        try {
            const stats = db.getUserStats(userId);
            const horasNaSemana = stats.thisWeekMs / (1000 * 60 * 60);

            
            const metas = [
                { nome: 'god', horas: 50, id: TicketDatabase.getConfig('meta_role_god', null) },
                { nome: 'ace', horas: 45, id: TicketDatabase.getConfig('meta_role_ace', null) },
                { nome: 'cry', horas: 40, id: TicketDatabase.getConfig('meta_role_cry', null) },
                { nome: 'high', horas: 35, id: TicketDatabase.getConfig('meta_role_high', null) },
                { nome: '1st', horas: 30, id: TicketDatabase.getConfig('meta_role_1st', null) },
                { nome: '2nd', horas: 25, id: TicketDatabase.getConfig('meta_role_2nd', null) },
                { nome: 'sub', horas: 20, id: TicketDatabase.getConfig('meta_role_sub', null) },
                { nome: 'base', horas: 15, id: TicketDatabase.getConfig('meta_role_base', null) }
            ];

            
            let cargoMerecidoId = null;
            for (const meta of metas) {
                if (meta.id && horasNaSemana >= meta.horas) {
                    cargoMerecidoId = meta.id;
                    break; 
                }
            }

            if (cargoMerecidoId) {
                
                if (!member.roles.cache.has(cargoMerecidoId)) {
                    await member.roles.add(cargoMerecidoId).catch(() => {});
                    console.log(`[Auto-UP] O membro ${member.user.tag} bateu a meta e recebeu o cargo ${cargoMerecidoId}`);
                }
            }
        } catch (error) {
            console.error('[VoiceTracker Auto-UP Error]', error);
        }
    }

        getUserStats(userId) {
        const stats = db.getUserStats(userId);
        
        
        const activeJoinedAt = this.activeJoins.get(userId);
        if (activeJoinedAt) {
            const currentSessionMs = Date.now() - activeJoinedAt;
            stats.totalMs += currentSessionMs;
            stats.thisWeekMs += currentSessionMs;
        }

        
        const fullRanking = this.getLiveRanking(999999); 
        const liveRankIndex = fullRanking.findIndex(u => u.id_usuario === userId);
        
        if (liveRankIndex !== -1) {
            stats.rank = liveRankIndex + 1;
        } else {
            stats.rank = fullRanking.length > 0 ? fullRanking.length + 1 : 1;
        }

        return stats;
    }

        getLiveRanking(limit = 10) {
        
        const stmt = db.db.prepare('SELECT id_usuario, tempo_total FROM usuarios');
        const dbUsers = stmt.all();
        
        
        const userMap = new Map();
        for (const row of dbUsers) {
            userMap.set(row.id_usuario, row.tempo_total);
        }

        
        for (const [userId, joinedAt] of this.activeJoins.entries()) {
            const currentSessionMs = Date.now() - joinedAt;
            const existingTime = userMap.get(userId) || 0;
            userMap.set(userId, existingTime + currentSessionMs);
        }

        
        const rankingArray = Array.from(userMap.entries()).map(([id_usuario, tempo_total]) => ({
            id_usuario,
            tempo_total
        }));

        rankingArray.sort((a, b) => b.tempo_total - a.tempo_total);

        return rankingArray.slice(0, limit);
    }
}


module.exports = new VoiceTracker();
