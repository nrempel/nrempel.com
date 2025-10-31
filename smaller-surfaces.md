## title
Smaller Surfaces

## subtitle
Why agent-generated helpers let you ship leaner stacks without slowing down.

## canonical
https://nrempel.com/smaller-surfaces.html

## author
Nicholas Rempel

## published
October 30, 2025

## published-iso
2025-10-30

## published-year
2025

## reading-time
12 min read

## abstract
Modern dependency graphs feel like thickets. Agents make it practical to generate narrow helpers, keep the runtime surface small, and verify the results with the tools you already trust. This essay looks at how to use generation over integration without slipping into wheel reinvention or fragile bespoke stacks.

## body
The average service today ships with a dependency tree that looks less like a tree and more like a thicket. You add one tidy helper and wake up with a hundred transitive packages, each with its own update cadence, license, and security history. We tolerate this because importing is fast, familiar, and usually good enough. The costs show up later in supply chain incidents, surprise API breaks, bloated images, and weeks spent patching instead of building. What has changed is not only that large models can write code. They also make a very different default attractive. Instead of integrating a library for every task, you can generate a narrow implementation, verify it locally against your standards, and keep the runtime surface small.

If that sounds like reinventing wheels, it helps to ground the idea in a mundane example. Suppose you need basic slug creation for post titles. Lowercase letters and digits, separators normalized to dashes, punctuation dropped. You could import a popular package and accept its transitive dependencies, many of which exist only to cover corner cases you do not have. Or you can ask an agent for a few lines of code that do exactly what you need, commit it alongside tests, and move on. The second path is not about purity. It is about shifting risk from opaque upstream code to code you can read, test, and reason about. The real benefit is that agents make small, bespoke code cheap. In the pre-agent world, writing that helper felt like a chore, so importing was rational. With a capable generator, the balance tips. You can ask for an implementation that matches a clear spec, have the agent produce tests first, and enforce your own static checks and performance budgets. Work that used to nudge you toward a dependency becomes trivial. As the friction of writing small modules drops, the structural benefits of a smaller dependency graph begin to stack up across your codebase.

This shift has a security angle, and it is easy to oversell, so precision matters. Fewer dependencies do not erase bugs. They change what you must trust. In a dependency heavy service, risk lives mostly in external code that changes on someone else’s schedule. You learn about a CVE when the scanner lights up and spend time finding a safe set of version pins that still builds. In a generation first service, risk lives mostly in your own verification pipeline. The agent is fallible, but the code is local, visible, and bound to the tests you write. That is a trade you can manage with tools you already use: type checkers, linters, property based tests, fuzzers for critical parsers, and review by engineers who understand the context. It is the difference between trusting a registry and trusting your CI.

Because “generate rather than import” can be taken too far, boundaries matter. A practical rule that holds up in real work is to generate leaf utilities and keep mature, high assurance libraries for the hard stuff. Formatting helpers, small data structures, constrained parsers for formats you control, and simple protocol clients that touch only a sliver of a large SDK are good candidates for generation. Cryptography, serious compression codecs, TLS stacks, and database drivers are not. When the blast radius of a subtle bug is high or the domain is all edge case, pay the dependency cost and wrap it behind a thin internal interface so you can swap implementations later with minimal churn. The point is not to eject from the ecosystem. It is to stop paying ecosystem prices for tasks that do not need them.

Process turns preference into practice. In teams that do this well, new runtime dependencies are not forbidden, but they are explicit. A CI check fails if the runtime graph grows unless the pull request carries a label that signals a deliberate choice backed by a short rationale. That single step turns “one more import will not hurt” into a small design review. Why do we need it, what is the transitive cost, and is there a generated alternative that meets the same requirement. Pair that with a tiny internal micro-stdlib of utilities you trust and your agent will naturally pull from home first. The micro-stdlib keeps retry logic, small caches, predictable JSON helpers, and durable path utilities close at hand, which further reduces the urge to import.

Verification is where the approach earns its keep. The workflow is simple and repeatable. Start with a tiny executable spec that lists inputs, outputs, invariants, and edge cases. Ask the agent to generate tests first, then the module. Run static analysis and property checks. Keep code small by policy. Set ceilings on function size and module length so reviewers never face a wall of text. If a function grows past the limit, the agent refactors. If a property test finds a counterexample, the agent fixes the bug and regenerates until the property holds. Even simple metamorphic properties pay off here. Encode then decode should be identity for supported inputs. Normalization should be idempotent. A cache that stores a value should return that value immediately after.

To take the slug example out of the abstract, here is the flavor of helper that can replace a package and its transitive friends:

```python
def slugify(title: str) -> str:
    out = []
    prev_dash = False
    for ch in title.lower():
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif ch in {' ', '_', '-'}:
            if out and not prev_dash:
                out.append('-')
                prev_dash = True
    if out and out[-1] == '-':
        out.pop()
    return ''.join(out)
```

This is not glamorous code, which is a feature. It is easy to read, trivial to test, and honest about what it does. If you later decide you need Unicode transliteration, revisit whether a vetted library is worth the cost. You do not pay that cost up front for problems you do not yet have.

Performance questions come up quickly, and the most practical answer is to treat performance as part of the spec. Ask the agent for both a dependency free and a dependency using implementation, then benchmark each under your workload. Many utilities are not on hot paths, so clarity and simplicity win by default. When something is hot, keep the micro benchmark in the repository and make the choice explicit in the pull request description. You reach the right outcome with data, not habit.

Measurement helps the benefits stay visible. Track the number of runtime dependencies and their transitive depth per service, the size of your SBOM, the count of open third party CVEs tied to your stack, and the artifact size of your release images or wheels. Watch build times and cold start times as the graph shrinks. When an upstream incident hits the news, look at your mean time to remediate compared to a year ago. If your agent has been trimming for months, there is simply less to patch.

If you want a gentle starting path that does not upend your process, pick one service and one week. During that week, treat every new helper as a generate unless proven otherwise candidate. For each import you would normally add, ask the agent to propose a no dependency implementation with tests and a short note comparing lines of code, expected maintenance cost, and any correctness caveats. Keep the human bar high. The generated code still merges through the same review as anything else. By the end of the week you will have a handful of merged examples, a few exceptions where a library remained the right choice, and real numbers you can share. Repeat that exercise, promote the best helpers into the micro-stdlib, and turn the CI gate for new dependencies into a standard part of your pipeline.

It is fair to ask whether this approach simply moves work around. You will write more of your own glue, but you will write less code that exists only to appease someone else’s release notes. The code you write will be smaller, more testable, and easier for your team to understand. The risks you accept will be the ones you can measure and control. Since agents are good at the boring parts like scaffolding, refactoring to meet style rules, and writing property tests, you can keep a high bar without slowing down.

None of this is an indictment of open source. The ecosystem is still where you go for the hard problems, the battle tested implementations, and the parts you should not roll yourself. The change is in the default. For a decade we integrated first and asked questions later. With competent code generating agents and a bit of policy, the new default can be to generate first, verify locally, and import only when the need is real. That simple inversion shrinks your attack surface, quiets your scanners, and makes the code you run easier to understand. In a world where complexity grows on its own, choosing smaller surfaces is one of the friendliest choices you can make for your future self, for your teammates, and for the systems you are responsible for keeping up.

## notes
Draft reflections on applying dependency-light workflows with agents; feedback and field notes are welcome.
