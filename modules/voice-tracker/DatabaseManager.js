const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
    constructor() {
        
        this.db = new Database(path.join(__dirname, '..', '..', 'database.sqlite'));
        this.initTables();
    }

    initTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario TEXT PRIMARY KEY,
                tempo_total INTEGER DEFAULT 0
            )
        `);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessoes_voz (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_usuario TEXT,
                tempo INTEGER,
                data_sessao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    updateUserTime(userId, timeSpent) {
        
        const stmtTotal = this.db.prepare(`
            INSERT INTO usuarios (id_usuario, tempo_total)
            VALUES (?, ?)
            ON CONFLICT(id_usuario) DO UPDATE SET tempo_total = tempo_total + excluded.tempo_total
        `);
        stmtTotal.run(userId, timeSpent);
        
        
        const stmtSessao = this.db.prepare(`
            INSERT INTO sessoes_voz (id_usuario, tempo)
            VALUES (?, ?)
        `);
        stmtSessao.run(userId, timeSpent);
    }

    getUserStats(userId) {
        
        const stmtTotal = this.db.prepare('SELECT tempo_total FROM usuarios WHERE id_usuario = ?');
        const userRow = stmtTotal.get(userId);
        const totalMs = userRow ? userRow.tempo_total : 0;

        
        const stmtRank = this.db.prepare('SELECT COUNT(*) as rank FROM usuarios WHERE tempo_total > ?');
        const rankRow = stmtRank.get(totalMs);
        const rank = (rankRow ? rankRow.rank : 0) + 1;

        
        const stmtThisWeek = this.db.prepare(`SELECT SUM(tempo) as total FROM sessoes_voz WHERE id_usuario = ? AND data_sessao >= datetime('now', '-7 days')`);
        const thisWeekRow = stmtThisWeek.get(userId);
        const thisWeekMs = thisWeekRow && thisWeekRow.total ? thisWeekRow.total : 0;

        
        const stmtLastWeek = this.db.prepare(`SELECT SUM(tempo) as total FROM sessoes_voz WHERE id_usuario = ? AND data_sessao >= datetime('now', '-14 days') AND data_sessao < datetime('now', '-7 days')`);
        const lastWeekRow = stmtLastWeek.get(userId);
        const lastWeekMs = lastWeekRow && lastWeekRow.total ? lastWeekRow.total : 0;

        return {
            totalMs,
            thisWeekMs,
            lastWeekMs,
            rank
        };
    }

    getAllUsersStats() {
        
        const stmt = this.db.prepare('SELECT id_usuario, tempo_total FROM usuarios');
        const users = stmt.all();
        
        const relatorio = [];

        for (const user of users) {
            
            const stmtThisWeek = this.db.prepare(`SELECT SUM(tempo) as total, MAX(data_sessao) as ultima_sessao FROM sessoes_voz WHERE id_usuario = ? AND data_sessao >= datetime('now', '-7 days')`);
            const weekData = stmtThisWeek.get(user.id_usuario);
            const thisWeekMs = weekData && weekData.total ? weekData.total : 0;
            
            
            const stmtLastActivity = this.db.prepare(`SELECT MAX(data_sessao) as ultima_sessao FROM sessoes_voz WHERE id_usuario = ?`);
            const lastActivityRow = stmtLastActivity.get(user.id_usuario);
            
            relatorio.push({
                id_usuario: user.id_usuario,
                tempo_total: user.tempo_total,
                thisWeekMs: thisWeekMs,
                ultima_sessao: lastActivityRow ? lastActivityRow.ultima_sessao : null
            });
        }
        
        return relatorio;
    }

    resetUserTotalTime(userId) {
        
        
        const stmt = this.db.prepare('UPDATE usuarios SET tempo_total = 0 WHERE id_usuario = ?');
        stmt.run(userId);
    }
}


module.exports = new DatabaseManager();
