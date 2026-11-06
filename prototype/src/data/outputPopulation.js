export const overseasEvents=events=>events.filter(event=>/overseas|foreign|international/i.test(`${event.aor} ${event.sourceType} ${event.place}`))
