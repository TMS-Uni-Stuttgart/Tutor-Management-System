package de.unistuttgart.iste.rss.tutormanagementsystem.config;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import lombok.Getter;

@Getter
public class ApplicationContextProvider implements ApplicationContextAware {
    private ApplicationContext ctx;

    public void setApplicationContext(ApplicationContext context) {
        this.ctx = context;
    }
}
