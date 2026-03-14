package com.mentorlink.mentorlink;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestMailConfig.class)
class MentorlinkApplicationTests {

	@Test
	void contextLoads() {
	}

}
