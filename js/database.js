class Database {
    db = null;

    constructor() {
        this.db = new Dexie("pelitra-db");
        this.db.version(1).stores({ movies: '++_id, Title, Poster, Type, Year, imdbID' });
        this.init();
    }

    async init() {
        await this.db.open();
    }

    async getMovies() {
        try {
            return await this.db.movies.toArray();
        }
        catch (error) {
            console.log(error);
        }
    }

    async saveMovie(movie) {
        try {
            await this.db.movies.add(movie);
        }
        catch (error) {
            console.log(error);
        }
    }

    async deleteMovie(id) {
        try {
            const movie = await this.getMovie(id);
            if (movie) {
                await this.db.movies.delete(movie._id);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    async getMovie(id) {
        try {
            return await this.db.movies.where('imdbID').equals(id).first();
        }
        catch (error) {
            console.log(error);
        }
    }
}

const database = new Database();