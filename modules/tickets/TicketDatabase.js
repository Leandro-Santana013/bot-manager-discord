const Database = require('better-sqlite3');
const path = require('path');

class TicketDatabase {
    constructor() {
        
        this.db = new Database(path.join(__dirname, '..', '..', 'database.sqlite'));
        this.initTables();
    }

    initTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS tickets_aceitos (
                id_usuario TEXT PRIMARY KEY,
                quantidade INTEGER DEFAULT 0
            )
        `);

        
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ticket_config (
                chave TEXT PRIMARY KEY,
                valor TEXT
            )
        `);
    }

    getConfig(key, defaultValue = '') {
        const stmt = this.db.prepare('SELECT valor FROM ticket_config WHERE chave = ?');
        const row = stmt.get(key);
        return row ? row.valor : defaultValue;
    }

    setConfig(key, value) {
        const stmt = this.db.prepare(`
            INSERT INTO ticket_config (chave, valor)
            VALUES (?, ?)
            ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor
        `);
        stmt.run(key, value);
    }

    addTicket(userId) {
        const stmt = this.db.prepare(`
            INSERT INTO tickets_aceitos (id_usuario, quantidade)
            VALUES (?, 1)
            ON CONFLICT(id_usuario) DO UPDATE SET quantidade = quantidade + 1
        `);
        stmt.run(userId);
    }

    getTopTickets(limit = 10) {
        const stmt = this.db.prepare('SELECT id_usuario, quantidade FROM tickets_aceitos ORDER BY quantidade DESC LIMIT ?');
        return stmt.all(limit);
    }
}


module.exports = new TicketDatabase();
