package com.bidx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BidXApplication {

    public static void main(String[] args) {
        SpringApplication.run(BidXApplication.class, args);
    }
}
