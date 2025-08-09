import * as SQLite from 'expo-sqlite';
import { User, Chat, Message } from '@/types';
import { AuthUser } from './authService';

export interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  participant: User;
}

class LocalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('simopagno_coaching.db');
      await this.createTables();
      await this.insertSampleData();
    } catch (error) {
      console.error('Errore nell\'inizializzazione del database:', error);
      // Se c'è un errore critico, prova a ricreare il database
      try {
        console.log('Tentativo di ricreazione database...');
        await this.resetDatabase();
        this.db = await SQLite.openDatabaseAsync('simopagno_coaching.db');
        await this.createTables();
        await this.insertSampleData();
      } catch (resetError) {
        console.error('Errore nella ricreazione del database:', resetError);
      }
    }
  }

  // Reset del database (per emergenze)
  async resetDatabase() {
    try {
      await SQLite.deleteDatabaseAsync('simopagno_coaching.db');
      console.log('Database resettato con successo');
    } catch (error) {
      console.error('Errore nel reset del database:', error);
    }
  }

  // Verifica struttura database
  async checkDatabaseStructure() {
    if (!this.db) return false;
    
    try {
      const result = await this.db.getFirstAsync("PRAGMA table_info(users)");
      console.log('Struttura tabella users:', result);
      return true;
    } catch (error) {
      console.error('Errore nella verifica struttura database:', error);
      return false;
    }
  }

  private async createTables() {
    if (!this.db) return;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK (role IN ('coach', 'client')) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Aggiungi colonne mancanti se la tabella esiste già
    const addMissingColumns = `
      ALTER TABLE users ADD COLUMN name TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT '';
    `;

    const createChatsTable = `
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        coach_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        last_message_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coach_id) REFERENCES users (id),
        FOREIGN KEY (client_id) REFERENCES users (id)
      );
    `;

    const createWorkoutsTable = `
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        coach_id TEXT NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users (id),
        FOREIGN KEY (coach_id) REFERENCES users (id)
      );
    `;

    const createWorkoutExercisesTable = `
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL,
        rest_time INTEGER,
        order_index INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
      );
    `;

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        media_url TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users (id)
      );
    `;

    await this.db.execAsync(createUsersTable);
    
    // Prova ad aggiungere le colonne mancanti (ignora errori se esistono già)
    try {
      await this.db.execAsync(addMissingColumns);
    } catch (error) {
      // Ignora errori se le colonne esistono già
      console.log('Colonne già esistenti o errore ignorato:', error);
    }
    
    await this.db.execAsync(createChatsTable);
    await this.db.execAsync(createWorkoutsTable);
    await this.db.execAsync(createWorkoutExercisesTable);
    await this.db.execAsync(createMessagesTable);
  }

  private async insertSampleData() {
    if (!this.db) return;

    // Aggiorna utenti esistenti con i nomi mancanti
    try {
      await this.db.runAsync(
        'UPDATE users SET name = ? WHERE email = ? AND (name IS NULL OR name = "")',
        ['Coach Simone', 'coach.simone@example.com']
      );
      await this.db.runAsync(
        'UPDATE users SET name = ? WHERE email = ? AND (name IS NULL OR name = "")',
        ['Coach Maria', 'coach.maria@example.com']
      );
      await this.db.runAsync(
        'UPDATE users SET name = ? WHERE email = ? AND (name IS NULL OR name = "")',
        ['Coach Marco', 'coach.marco@example.com']
      );
      await this.db.runAsync(
        'UPDATE users SET name = ? WHERE email = ? AND (name IS NULL OR name = "")',
        ['Client Test', 'client.test@example.com']
      );
    } catch (error) {
      console.log('Errore nell\'aggiornamento utenti esistenti:', error);
    }

    // Inserisci utenti di esempio (senza password per compatibilità)
    const sampleUsers = [
      { id: '1', email: 'coach.simone@example.com', name: 'Coach Simone', role: 'coach', password_hash: 'dummy' },
      { id: '2', email: 'coach.maria@example.com', name: 'Coach Maria', role: 'coach', password_hash: 'dummy' },
      { id: '3', email: 'coach.marco@example.com', name: 'Coach Marco', role: 'coach', password_hash: 'dummy' },
      { id: '4', email: 'client.test@example.com', name: 'Client Test', role: 'client', password_hash: 'dummy' },
    ];

    for (const user of sampleUsers) {
      try {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO users (id, email, name, role, password_hash) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.email, user.name, user.role, user.password_hash]
        );
      } catch (error) {
        console.log('Errore nell\'inserimento utente:', user.email, error);
      }
    }

    // Inserisci chat di esempio
    const sampleChats = [
      { id: '1', coach_id: '1', client_id: '4' },
      { id: '2', coach_id: '2', client_id: '4' },
      { id: '3', coach_id: '3', client_id: '4' },
    ];

    for (const chat of sampleChats) {
      await this.db.runAsync(
        'INSERT OR IGNORE INTO chats (id, coach_id, client_id) VALUES (?, ?, ?)',
        [chat.id, chat.coach_id, chat.client_id]
      );
    }

    // Inserisci messaggi di esempio
    const sampleMessages = [
      { id: '1', chat_id: '1', sender_id: '1', content: 'Ciao! Come stai?', is_read: 1 },
      { id: '2', chat_id: '1', sender_id: '4', content: 'Ciao coach! Sto bene, grazie!', is_read: 1 },
      { id: '3', chat_id: '1', sender_id: '1', content: 'Come è andato l\'allenamento di oggi?', is_read: 0 },
      { id: '4', chat_id: '2', sender_id: '2', content: 'Ottimo lavoro con la dieta!', is_read: 1 },
      { id: '5', chat_id: '3', sender_id: '3', content: 'Ricordati di fare stretching', is_read: 0 },
    ];

    for (const message of sampleMessages) {
      await this.db.runAsync(
        'INSERT OR IGNORE INTO messages (id, chat_id, sender_id, content, is_read) VALUES (?, ?, ?, ?, ?)',
        [message.id, message.chat_id, message.sender_id, message.content, message.is_read]
      );
    }
  }

  // Ottieni tutte le conversazioni dell'utente corrente
  async getConversations(userId: string): Promise<ConversationItem[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(`
        SELECT 
          c.id,
          c.last_message_at,
          u.id as participant_id,
          u.email as participant_email,
          u.role as participant_role,
          m.content as last_message_content,
          m.created_at as last_message_time,
          m.is_read as last_message_read
        FROM chats c
        LEFT JOIN users u ON (c.coach_id = u.id AND c.client_id = ?) OR (c.client_id = u.id AND c.coach_id = ?)
        LEFT JOIN (
          SELECT chat_id, content, created_at, is_read
          FROM messages 
          WHERE id = (
            SELECT id FROM messages 
            WHERE chat_id = messages.chat_id 
            ORDER BY created_at DESC 
            LIMIT 1
          )
        ) m ON c.id = m.chat_id
        WHERE c.coach_id = ? OR c.client_id = ?
        ORDER BY c.last_message_at DESC
      `, [userId, userId, userId, userId]);

      return result.map(row => ({
        id: row.id,
        name: row.participant_email || 'Utente sconosciuto',
        lastMessage: row.last_message_content || 'Nessun messaggio',
        timestamp: this.formatTimestamp(row.last_message_time || row.last_message_at),
        unreadCount: 0, // Calcoleremo questo separatamente
        avatar: this.getAvatarForUser({ role: row.participant_role } as User),
        participant: {
          id: row.participant_id,
          email: row.participant_email,
          role: row.participant_role,
          created_at: '',
          updated_at: ''
        }
      }));
    } catch (error) {
      console.error('Errore nel recupero delle conversazioni:', error);
      return [];
    }
  }

  // Ottieni i messaggi di una chat specifica
  async getMessages(chatId: string): Promise<Message[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(`
        SELECT 
          m.id,
          m.chat_id,
          m.sender_id,
          m.content,
          m.message_type,
          m.media_url,
          m.is_read,
          m.created_at,
          u.id as sender_user_id,
          u.email as sender_email,
          u.role as sender_role
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = ?
        ORDER BY m.created_at ASC
      `, [chatId]);

      return result.map(row => ({
        id: row.id,
        chat_id: row.chat_id,
        sender_id: row.sender_id,
        content: row.content,
        message_type: row.message_type,
        media_url: row.media_url,
        is_read: Boolean(row.is_read),
        created_at: row.created_at,
        sender: {
          id: row.sender_user_id,
          email: row.sender_email,
          role: row.sender_role,
          created_at: '',
          updated_at: ''
        }
      }));
    } catch (error) {
      console.error('Errore nel recupero dei messaggi:', error);
      return [];
    }
  }

  // Invia un nuovo messaggio
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message | null> {
    if (!this.db) return null;

    try {
      const messageId = Date.now().toString();
      const timestamp = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO messages (id, chat_id, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [messageId, chatId, senderId, content, timestamp]
      );

      // Aggiorna il timestamp dell'ultimo messaggio nella chat
      await this.db.runAsync(
        'UPDATE chats SET last_message_at = ? WHERE id = ?',
        [timestamp, chatId]
      );

      // Ottieni il messaggio appena creato
      const result = await this.db.getFirstAsync(`
        SELECT 
          m.id,
          m.chat_id,
          m.sender_id,
          m.content,
          m.message_type,
          m.media_url,
          m.is_read,
          m.created_at,
          u.id as sender_user_id,
          u.email as sender_email,
          u.role as sender_role
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `, [messageId]);

      if (!result) return null;

      return {
        id: result.id,
        chat_id: result.chat_id,
        sender_id: result.sender_id,
        content: result.content,
        message_type: result.message_type,
        media_url: result.media_url,
        is_read: Boolean(result.is_read),
        created_at: result.created_at,
        sender: {
          id: result.sender_user_id,
          email: result.sender_email,
          role: result.sender_role,
          created_at: '',
          updated_at: ''
        }
      };
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      return null;
    }
  }

  // Crea una nuova conversazione
  async createConversation(clientId: string, coachId: string): Promise<Chat | null> {
    if (!this.db) return null;

    try {
      // Verifica se esiste già una conversazione tra questi utenti
      const existingChat = await this.db.getFirstAsync(
        'SELECT * FROM chats WHERE (client_id = ? AND coach_id = ?) OR (client_id = ? AND coach_id = ?)',
        [clientId, coachId, coachId, clientId]
      );

      if (existingChat) {
        return existingChat;
      }

      // Crea una nuova conversazione
      const chatId = Date.now().toString();
      const timestamp = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO chats (id, client_id, coach_id, created_at) VALUES (?, ?, ?, ?)',
        [chatId, clientId, coachId, timestamp]
      );

      return {
        id: chatId,
        client_id: clientId,
        coach_id: coachId,
        last_message_at: timestamp,
        created_at: timestamp,
        participants: []
      };
    } catch (error) {
      console.error('Errore nella creazione della conversazione:', error);
      return null;
    }
  }

  // Crea un nuovo utente
  async createUser(user: AuthUser): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO users (id, email, name, role, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.name, user.role, user.password_hash, user.created_at, user.updated_at]
      );
    } catch (error) {
      console.error('Errore nella creazione utente:', error);
      throw error;
    }
  }

  // Ottieni utente per email
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!result) return null;

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        password_hash: result.password_hash,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Errore nel recupero utente per email:', error);
      return null;
    }
  }

  // Ottieni utente per ID
  async getUserById(id: string): Promise<AuthUser | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        password_hash: result.password_hash,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Errore nel recupero utente per ID:', error);
      return null;
    }
  }

  // Ottieni tutti i coach disponibili
  async getAvailableCoaches(): Promise<User[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM users WHERE role = ?',
        ['coach']
      );

      return result.map(row => ({
        id: row.id,
        email: row.email,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Errore nel recupero dei coach:', error);
      return [];
    }
  }

  // Ottieni allenamenti di un utente
  async getUserWorkouts(userId: string): Promise<any[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync(`
        SELECT 
          w.*,
          u.name as coach_name,
          u.email as coach_email
        FROM workouts w
        LEFT JOIN users u ON w.coach_id = u.id
        WHERE w.client_id = ? OR w.coach_id = ?
        ORDER BY w.date DESC
      `, [userId, userId]);

      return result;
    } catch (error) {
      console.error('Errore nel recupero allenamenti:', error);
      return [];
    }
  }

  // Ottieni un allenamento specifico
  async getWorkout(workoutId: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(`
        SELECT 
          w.*,
          u.name as coach_name,
          u.email as coach_email
        FROM workouts w
        LEFT JOIN users u ON w.coach_id = u.id
        WHERE w.id = ?
      `, [workoutId]);

      return result;
    } catch (error) {
      console.error('Errore nel recupero allenamento:', error);
      return null;
    }
  }

  // Crea un nuovo allenamento
  async createWorkout(workout: any): Promise<any | null> {
    if (!this.db) return null;

    try {
      const workoutId = Date.now().toString();
      const timestamp = new Date().toISOString();

      await this.db.runAsync(
        'INSERT INTO workouts (id, client_id, coach_id, name, date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [workoutId, workout.client_id, workout.coach_id, workout.name, workout.date, workout.status, timestamp]
      );

      return {
        id: workoutId,
        ...workout,
        created_at: timestamp
      };
    } catch (error) {
      console.error('Errore nella creazione allenamento:', error);
      return null;
    }
  }

  // Aggiorna lo stato di un allenamento
  async updateWorkoutStatus(workoutId: string, status: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.runAsync(
        'UPDATE workouts SET status = ? WHERE id = ?',
        [status, workoutId]
      );
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento stato allenamento:', error);
      return false;
    }
  }

  // Completa un esercizio
  async completeWorkoutExercise(exerciseId: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.runAsync(
        'UPDATE workout_exercises SET is_completed = 1 WHERE id = ?',
        [exerciseId]
      );
      return true;
    } catch (error) {
      console.error('Errore nel completamento esercizio:', error);
      return false;
    }
  }

  // Ottieni esercizi disponibili
  async getAvailableExercises(): Promise<any[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.getAllAsync('SELECT * FROM exercises ORDER BY name');
      return result;
    } catch (error) {
      console.error('Errore nel recupero esercizi:', error);
      return [];
    }
  }

  // Segna i messaggi come letti
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'UPDATE messages SET is_read = 1 WHERE chat_id = ? AND sender_id != ?',
        [chatId, userId]
      );
    } catch (error) {
      console.error('Errore nel marcare i messaggi come letti:', error);
    }
  }

  // Utility per formattare il timestamp
  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    }
  }

  // Utility per ottenere l'avatar dell'utente
  private getAvatarForUser(user: User | undefined): string {
    if (!user) return '👤';
    return user.role === 'coach' ? '👨‍💼' : '👤';
  }
}

// Esporta un'istanza singleton
export const localDatabase = new LocalDatabase();
