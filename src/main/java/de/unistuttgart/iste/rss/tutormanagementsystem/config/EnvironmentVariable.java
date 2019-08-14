package de.unistuttgart.iste.rss.tutormanagementsystem.config;

/**
 * EnvironmentVariables
 */
public enum EnvironmentVariable {
    TMS_DB_ENCRYPTION_KEY, TMS_SERVER_INITIAL_ADMIN_PASSWORD;

    @Override
    public String toString() {
        return this.name();
    }
}
