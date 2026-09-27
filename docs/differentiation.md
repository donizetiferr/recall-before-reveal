# Differentiation and prior art

## The narrow job

A curious person finishes reading an AI explanation. Rather than asking another model whether they understood it, they paste their own questions and references, close the explanation, write an answer, and record how confident they feel before looking. The practical output is an inspectable JSON log, not a score or a promise about learning.

The original contribution here is the small, deliberate combination of an offline page, required written commitment, separate before-reveal confidence, locked attempt snapshots, optional after-reveal reflection, and readable exports. It is not the invention of recall practice, flashcards, confidence ratings, or self-assessment.

## Prior art considered

**Anki.** Its studying manual describes showing a question first, revealing its answer, and reviewing cards in a scheduled study workflow [1]. Anki also supports typing an answer through its card templates [2]. This project does not claim to invent typing before reveal or to replace Anki. It deliberately omits scheduling, deck management, template customization, and lexical answer comparisons. The default workflow instead keeps the typed answer and pre-reveal confidence together as a portable record. Anki's existing extensibility may support similar workflows; no exhaustive add-on survey was performed.

**Quizlet Flashcards.** The official help describes flipping cards, moving through a set, shuffling, audio, and sorting into learning/known groups [3]. This project narrows the interaction to an explicit written attempt followed by an optional comparison. Its lack of accounts and server infrastructure is a property of this implementation, not a claim that every competing product lacks an offline mode or export feature.

**A paper notebook or a plain text document.** Covering an answer and writing a response already accomplishes much of this job. This page adds consistent ordering, a separate confidence field, protection against accidentally changing the recorded response through its UI, and a structured export. A notebook can be preferable when handwriting or avoiding screens is the priority.

## Demonstrable difference, not an efficacy claim

The synthetic demo begins with a high-confidence answer that says only to make a message sound better. After revealing a reference that includes audience, purpose, tone, and preserved facts, the scripted user marks “Missed something” and adds a note. The original answer and confidence remain visible in the export. The software does not detect that gap; it preserves the user's observation.

The second answer is self-marked as capturing the main idea. No percentages, simulated customer results, generated questions, model calls, or claims of independent learning evaluation are involved.

## Intentional limits

This is not a semantic grader, adaptive tutor, spaced-repetition system, secure examination app, or calibrated measure of knowledge. References can be wrong. Confidence can be misleading. Local data can be edited outside the interface. Export import, synchronization, conflict resolution between tabs, and learning-outcome studies are outside this implementation.

## Sources

Primary documentation consulted on 2026-09-27. Descriptions are limited to the referenced workflows; this is not a feature-by-feature competitive audit.

[1] Anki Manual, “Studying”: https://docs.ankiweb.net/studying.html

[2] Anki Manual, “Field Replacements — Checking Your Answer”: https://docs.ankiweb.net/templates/fields.html#checking-your-answer

[3] Quizlet Help, “Studying with Flashcards”: https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards
