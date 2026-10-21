Vibe Coding and the Weight Class Problem

There's something that has been bothering me about the way a lot of people are building software right now, and I think it comes down to a concept that boxing figured out a long time ago, which is that you shouldn't put fighters in the ring with opponents who are far outside of their weight class, because the results are predictable and usually pretty ugly for the smaller fighter.

Vibe coding, which is the practice of describing what you want to an AI tool and letting it generate most or all of the code, has made it possible for people to build things that are way beyond what they actually understand. That's exciting in some ways. It's also dangerous in ways that aren't obvious until something breaks, and when something breaks in a system you didn't really build, you often have no idea where to even start looking.

Traditional development had friction built in. You learned by running into walls. Every error message taught you something about where the boundaries of the system were. With vibe coding a lot of that friction is removed, which feels great, but it can give you a false sense of mastery that disappears the first time you need to debug a production issue at 2am or figure out why your auth setup is leaking user data.

So what do you do about it? I think the answer is to be honest about your weight class. Build things you could at least roughly explain. When the AI generates something you don't understand, stop and ask it to explain, or go read about it. Grow into heavier weight classes gradually instead of jumping straight into the ring with a distributed system you can't reason about.
