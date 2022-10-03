# You won't believe how much time I saved using Comby to rewrite my code

Okay, full disclosure, this post is really just me shilling for a desktop app I created for Comby.

Also, TL;DR, a lot. It saved a lot of time. You should [check it out](https://comby.dev/). You should also checkout
the [Desktop App I made for it](https://github.com/formidableLabs/gui4comby).

I've known about Comby for a long time. I watched a strange loop talk by **Rijnard van Tonder**
entitled [Parser Parser Combinators for Program Transformation](https://www.youtube.com/watch?v=JMZLBB_BFNg) in Sept of
2019. It was a really compelling topic and lead up to the introduction of a tool called Comby created by Rijnard for
performing code changes. I saw immediately, how helpful it could be and how it could make my life easier when making
certain kinds of code changes. *I promptly forgot it existed*.

Until recently (June of 2022), when I rediscovered both the talk and the tool. Fortunately, I had a real life work task
that provided the perfect opportunity for me to actually try the tool. I needed to rewrite a test suite that was written
using the node UVU framework and have it use Jest instead.

Tests written in UVU are structurally very similar to those written in Jest (or mocha). There's a few subtleties, such
as the suite variable name typically changing from file to file, that make broad find/replace cumbersome. So the
conversion itself wasn't particularly hard. It would just be a tedious repetition of many slightly different
find/replace commands and slight code block reshuffling for 20 or 30 some odd files.

The appeal of using Comby for the task, is that It would (supposedly) allow me to (simply) write find/replace patterns
with ease that would apply across the code base. And because Comby "understands code" I don't have to overtax my brain
thinking of crazy regex patterns that encompass all the possible ways to write code.

Keep in mind, that this blog piece is a retrospective of a task already completed. Of course there was some learning
curve with the Comby syntax. However, it was really strait forward and I was able to use
the [comby.live](https://comby.live/) web UI to develop and test my patterns out before running them against my code
base. The web UI is really useful, but has a major draw back -- the source code input is limited in size. So I had to
frequently play with code snippets and cut out chunks of code (without invalidating the scenario I was trying to match)
until the code fit. <i>This was one of the major reasons I ended up creating a desktop app version of the web UI, more on
that later</i>.

So in the examples below, I'll just be demonstrating the patterns I ended up with.

First, I'll quickly review the general anatomy of UVU and Jest tests for comparison. Below, is a typical UVU test suite. 
Please forgive the no-op functions used to show testing structure.

```typescript
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const sqrtSuite = suite('Math.sqrt()');

sqrtSuite.before = (context /*shared state between tests*/) => {
  // perform some setup once
	// probably set context.something = blah, etc
}

sqrtSuite.before.each = (context) => {
  // perform some setup for each test
}


sqrtSuite('sampled results', (context) => {
  assert.is(Math.sqrt(4), 2);
  assert.is(Math.sqrt(144), 12);
  assert.is(Math.sqrt(2), Math.SQRT2);
});

sqrtSuite.run();
```

And this, is the same test, but if it were written in Jest.

```typescript
import {describe, expect, test} from '@jest/globals';

describe('Math.sqrt()', () => {
	beforeAll(() => {
		// perform some setup once
	});
  beforeEach(() => {
		// perform some setup for each test
	});
  test('sampled results', () => {
	  expect(Math.sqrt(4)).toBe(2);
	  expect(Math.sqrt(144)).toBe(12);
	  expect(Math.sqrt(2)).toBe(Math.SQRT2);
  });
});
```

Standing back and squinting, the test structure is really similar. There's some nuances with shared test state scope,
indentation, and test definition, but it turns out, nothing we can't handle with Comby!

Generally speaking if I were to list the steps I would take to convert a file from UVU to Jest, it might look like:

1. Replace the suite variable definition with `describe('<suite name>', () => { /*placeholder*/ })` and delete the suite
   variable run line `sqrtSuite.run();`
2. Move (cut/paste) the rest of file into the placeholder block scope
3. If the tests use context, create a describe block level `context` variable to hold the shared state, and update
   functions removing context parameter so they just reference the block scope variable.
4. Find each occurrence of `assert.` and replace it with a handcrafted `expect(x).toBe(y)` expressions.

Each of these steps, I could go the route of trying to handcraft regex match and replace patterns to apply across all
my test files -- but as Jamie Zawinski famously said

<blockquote style="border-left: solid 5px #ccc; padding-left: 1rem"><p>Some people, when confronted with a problem, think "I know, I'll use regular expressions." Now they have two problems.</p></blockquote>

Things that make the code change difficult to regex:

* In UVU the test suite can be named, and is likely to be different in each test file. Ie you're more likely to
  see `const myXSuite = suite('myX');` rather than a unified name like `const testSuite = suite('myX');`
* Inconsistent code style: from how functions and variables are defined to spacing before/after symbols, etc.
  Ie `function foo(a,b,c){` vs `const bar = ({a, b, c}:{a: string, b: number, c: boolean}) => { `. Not to forget quoted
  strings and escape characters and who knows what. I'd have to account for a lot of possibilities.
* Custom assertions library. Nothing out of the ordinary, so I could find a mapping to a Jest expect equivalent, but
  there's going to be lots of structural changes to the line in regards to parameterization.
* The suite structure is a bit more flat in UVU and tends to be nested in Jest.
* UVU offers context for test suites as an object passed to suite creation and to each test where as block scope in the
  describe block represents your context in Jest. (not featured in the sample).

All in all, I'd likely spend more time crafting perfect regex patterns for one scenario than it would take to fix all
the scenarios by hand in one test. And it would be less mentally exhaustive to repeat the process for each file by hand.

Alright, so time to show how Comby let me deal w/ those issues w/out becoming an expert in regex pattern matching.

I'll use the below simple integration test to demonstrate the edge cases I needed to solve for for find/replace changes
to work. It is a sanitized example from the real world project. Despite it's simplifications I think it's good enough to
demonstrate the power of Comby.

```typescript
import { suite } from 'uvu';
import * as assert from "uvu/assert";
import { gql } from 'graphql-request';
import { request } from '../utils';

const testSuite = suite('fruits list');

testSuite.before(async context => {
  const query = gql`
    query Lists {
      Fruits
    }
  `;

  context.responseData = await request({ query });
});

testSuite('Should return array of strings', context => {
  const { Fruits } = context.responseData.data;
  assert.ok(Array.isArray(Fruits));
  Fruits(f => {
    assert.type(f, 'string');
  });
});

testSuite('Should not have errors in the response', context => {
  assert.ok(context.responseData.errors === undefined);
});

testSuite.run();
```

In each example, I'll provide the match, rewrite and rule template snippet and a screenshot showing them in progress (
Just to show off the desktop app I created).

Starting with something easy, I'll take care of the import statements. Out with the old and in with the new! I've
trivially included mixed quotes in the sample just for exercise but you wouldn't need to deal with this if you're using
code linting w/ auto formatting.

I'll start w/ fixing the quote styles of all our imports.

*Match Template*

```
import :[imports] from :[source];
```

We use the hole `:[imports]` to handle the various kinds of imports that might have been used (wildcard, default, named)
. So imports like  `* as blah`, `{some}` or `some, {some2, some3}` all get matched. And `:[source]` will capture either
single or double quoted references. Oh, and I should mention that `imports` and `source` aren't special values, they are
arbitrary values that name the hole for later reference. I could have used `:[foo]` and `:[bar]` if I wanted to. For
more detailed documentation on how hole matching works,
see [how matching works](https://comby.dev/docs/basic-usage#how-matching-works).

*Rewrite Template*

```
import :[imports] from :[source];
```

Our rewrite template is actually the same. Normally, this wouldn't result in a change -- but we're going to use a "
rewrite expression" in our rule template to change the content of  `:[source]`.

*Rule Template*

```
where rewrite :[source] { '":[s]"' -> "':[s]'" }
```

Our rule template includes a rewrite expression. It tells Comby how we're going to transform the `:[source]` hole.
You'll notice we're using hole expression in the rewrite pattern, thats because the rewrite expression like a nested
match/rewrite template. We're telling Comby to match a double quoted value and to rewrite it as a single quoted value.
So `import * as assert from "uvu/assert";`  becomes  `import * as assert from 'uvu/assert';`.

Here it is in action!
![matched lines and holes are highlighted in the source code area, and rewritten lines and holes are highlighted in Rewritten area](/imgs/posts/2022-10-03-fig1.png)

Now, that quote style has been fixed up, I'll remove the `uvu` and `uvu/assert` imports from my code. Keep in mind that
I'm only operating on this one file for the demonstration, in the real life project I ran these patterns on the test
directory to fix up all files in one operation!

*Match Template*

```
import :[imports] from 'uv';:[~\n]
```

Again, I'm using the `:[imports]` hole to match any style of import from the UVU library. And I've dropped the hole for
source because I'm targeting a specific import. Okay, there's something new here `:[~\n]`. This is an anonymous hole
that matches based on Regex and its being used to capture the newline. Ugh, I know. But it's a really tiny, simple
pattern used to match the newline character--I'll forgive it. You can see more details on what is supported in the match
syntax [here](https://comby.dev/docs/syntax-reference#match-and-rewrite-syntax).

*Rewrite Template*

```
```

Here we're telling Comby to replace the match with nothing. This is why I've added a newline capture, so that the entire
line (and newline character) will be removed.

*Rule Template*

```
where true
```

The `where true` is basically a no op, the rule won't have an impact the match or rewrite.

Now, I could totally repeat this pattern for each import I want to remove, and in this case there's only two so that
would be no problem. But I can actually write the templates in a way to take care of all the imports at once, and it's
expandable so it could handle all the ones I wanted to replace. Check this out.

*Match Template*

```
import :[imports] from :[source];:[~\n]
```

I'll bring back the hole for the source, and change the rule template to:

*Rule Template*

```
where match :[source] {
  | "'uvu'" -> true
  | "'uvu/assert'" -> true
}
```

Awww yeah! This rule expression tells Comby the match is valid if source is either `'uvu'`  or `'uvu/assert'`. I could
expand it by simply adding more `| "<match pattern>" -> <boolean>` statements. That's pretty neat. Read more about
pattern match expressions [here](https://comby.dev/docs/advanced-usage#pattern-match-expressions).

![Action shot of import removal](/imgs/posts/2022-10-03-fig2.png)


I've removed the old imports, but I still want to add the jest import (this isn't always necessary, depending on the
environment configuration). I'll do a quick addition here:
*Match Template*

```
:[all]
```

First, I want to match the entire file, I named the the hole `all` but again, the name is arbitrary.

*Rewrite Template*

```
import {before, describe, expect, test} from '@jest/globals';
:[all]
```

In the rewrite I make my addition. I'm just going to slap it on top.

*Rule Template*

```
where true
```

I don't need any fancy handling in the rule.

Okay full disclosure, this example is really only good if you know what imports you'll need. In the real use case,
across the entire test suite I didn't know which particular jest globals I'd need in each test. I would have had to do a
manual followup after this where I built the project, went into each test file with missing reference errors, and
imported the missing references. Not too difficult or tedious, but instead I just configured my project so I didn't need
to import the jest globals explicitly.

![Anyway, here's our example in action](/imgs/posts/2022-10-03-fig3.png)

Here's a look at the current state of our source code

```
import {before, describe, expect, test} from '@jest/globals';
import { gql } from 'graphql-request';
import { request } from '../utils';

const testSuite = suite('fruits list');

testSuite.before(async context => {
  const query = gql`
    query Lists {
      Fruits
    }
  `;

  context.responseData = await request({ query });
});

testSuite('Should return array of strings', context => {
  const { Fruits } = context.responseData.data;
  assert.ok(Array.isArray(Fruits));
  Fruits(f => {
    assert.type(f, 'string');
  });
});

testSuite('Should not have errors in the response', context => {
  assert.ok(context.responseData.errors === undefined);
});

testSuite.run();
```

Next was a little more complicated. The challenge is changing the structure of the tests to match the Jest format. I
wanted to get all of the tests inside a Jest "describe" scope and replace all the UVU testSuite invocations with Jest "
test" invocations.

*Match Template*

```
const :[name] = suite(:[description]);
:[tests]
:[name].run();
```

Here I'm using `:[name]` to capture the variable that is assigned the instance of the suite. And `:[description]`
captures the string parameter passed to the suite instantiation. I know I'll use this for the describe block
description. Then I use `:[tests]` to basically match the rest of the file following the suite instantiation util it
reaches the test execution line matched by  `:[name].run()`. The `:[name]` has already been defined, so now I'm using it
as a reference. It means match based on what is inside the first usage of the hole.

*Rewrite Template*

```
describe(:[description], () => {
  const context = {};
  :[tests]
});
```

Now, I just redefine my test structure by creating a Jest describe scope and dumping the contents of the `:[tests]`
hole inside it. Notice I added an empty context block I'll use for shared state. Keep in mind, it's not going to
rebalance the indentation when it rewrites the code. I'll need to take care of that on my own (yay eslint & prettier to
do this automatically).

This is a good starting point, but I still have to handle some of those nuances I mentioned earlier. I still need to
turn the `testSuite()` invocations into Jest `test` invocations, and I'll need to deal with the tests w/ shared context
usage. This is where I'm really going to make use of rewrite rules.

*Rule Template*

```
where 
rewrite :[tests] { :[name].before(:[fn]) -> "before(:[fn])" },
rewrite :[tests] { :[name](:[scenario], :[rest]) -> "test(:[scenario], :[rest])" }
```

In this rule, we've got rewrite expressions to handle rewriting the before hook and tests. I'll break it up by each
rewrite:

1. `rewrite :[tests] { :[name].before(:[fn]) -> "before(:[fn])" },`  This rewrite line handles our before functions.
   Mapping `testSuite.before(/*..*/)` to `before(/*..*/)`. We use `:[fn]` to capture the function provided to before,
   since it's directly compatible with Jest before hook argument (the function to run prior to all tests).
2. `rewrite :[tests] { :[name](:[scenario], :[rest]) -> "test(:[scenario], :[rest])" }`  This rewrite line handles each
   test case invocation. We use `:[name]` to match the test suite variable and replace it with Jest's `test` function
   call. The first argument of the invocation is the test description so we match it with `:[scenario]` and the second
   argument is the test function which we grab with `:[rest]`. Our function hole in both rewrite expressions will handle
   any style of function definition so  `arg => { /*body */ }` , `(arg1, arg2) => { /*body*/ }`
   and `function( /*args*/) { /*body*/ }` are all accounted for. I've added an extra test that uses `function(){}`
   syntax, to show it being handled.

![Getting closer!](/imgs/posts/2022-10-03-fig4.png)

Granted, the newline and indentation is not ideal -- but that's what `eslint & prettier` is for, it will make sure the
code is properly indented and matches style guidelines after I make my changes.

Now, I haven't yet resolved the context variable. The tricky thing is, though not seen in the sample code, is that a
programmer could have chosen to name the context argument anything. So it could one of `context,ctx,c,_` or any other
value! So if I'm going to need some rewrite pre-work to address it.

Here's our sample file so far. However, I've gone and renamed each "context" parameter name to something different, so
that I can show how to handle that with the next series of patterns.

```
import {before, describe, expect, test} from '@jest/globals';
import { gql } from 'graphql-request';
import { request } from '../utils';

describe('fruits list', () => {
  const context = {};
  before(async (testContext) => {
    const query = gql`
      query Lists {
        Fruits
      }
    `;
  
    testContext.responseData = await request({ query });
  });
  
  test('Should return array of strings', ctx => {
    const { Fruits } = ctx;
    assert.ok(Array.isArray(Fruits));
    Fruits(f => {
      assert.type(f, 'string');
    });
  });
  
  test('Should not have errors in the response', async (c) => {
    assert.ok(c.responseData.errors === undefined);
  });
  
  test('test', async function(_) {
    assert.ok('it works');
  });
});
```

First thing, I'll handle the before function in isolation.
*Match Template*

```
before(:[async] :[ctx] => {:[rest]})
```

Neat trick here, holes match *zero* or more chars. So I'm using the `:[async]` hole to optionally match the  `async`
portion of the function definition (if it exists). And `:[ctx]`  will grab the parameters portion of the definition
which may or may not be surrounded by `()`. And `:[rest]` just grabs the rest of the function body.

*Rewrite Template*

```
before(:[async] () => {:[rest]})
```

Almost identical to the match template, but I've removed the context parameter from the function definition (because I
want to reference the context variable from the outside scope.

*Rule Template*

```
where 
rewrite :[ctx] { "(:[s])" -> ":[s]" },
rewrite :[rest] { :[ctx]. -> "context." },
rewrite :[rest] { :[before~[^a-zA-Z0-9]]:[ctx]:[after~[^a-zA-Z0-9]] -> ":[before]context:[after]" }
```

Okay, so the first rewrite handles the scenario when the function definition argument is surrounded by `()`
Ie `(ctx)=>{}`. In order to get access to the argument name, the rewrite just drops the parens, so that  `:[ctx]` will
just be the argument name. If the function definition was `ctx => {}` then `:[ctx]` is already the argument name by
itself and this rewrite expression is ignored.

The second rewrite expression is where I address the accessor references to the context argument inside the block scope
of the function. So places references like  `context.foo`.

And the third rewrite expression. Sigh, more regex. The thing is sometimes the reference the context is w/out the `.`
accessor syntax. Ie `console.log(context)` or `let {alb} = context;`. And sometimes the context variable name shows up
as the prefix/postfix to another variable name like `contextFoo` or `foocontext`. This rewrite expression handles these
scenarios. The `:[ctx]` hole obviously matches against the context variable name we're searching for, but then I prepend
and append `:[before~[^a-zA-Z0-9]]` and `[after~[^a-zA-Z0-9]]` it tells Comby to (optionally) capture non alphabet/digit
character following. This excludes the occurrences of the context variable name in other variable names (
like `contextFoo` or `foocontext`) but includes occurrences like `context, ` or `context;` or `context)`.  
Imagine if we had the line `console.log(mytestContext, testContext, foo, testContextFoo, testContext);` in our function
body, it would end up rewritten like `console.log(mytestContext, context, foo, testContextFoo, context);` leaving
similarly named variables alone and changing our context variable name appropriately.

![Hey, that actually wasn't too painful](/imgs/posts/2022-10-03-fig5.png)

I'll quickly fix up the function definition styles so they are all consistent. Fat arrow style is the preferred style,
with args in parens. Ie `(/*args*/) => {}`
*Match Template* & *Rewrite Template*

```
test(:[desc], :[fn]{:[body]});
``` 

Same template because we're using a rewrite rule to make the actual changes. The `:[fn]` hole is going to match all
of `function(/*args*/)`, `(/*args*/)=>` and `/*arg*/ =>` it will also match any potential async
prefix `async (/*args*/)=>`. And `:[body]` will capture the actual function body.

*Rule Template*

```
where 
rewrite :[fn] { "function(:[args])" -> "(:[args]) =>" },
rewrite :[fn] { ":[[arg]] =>" -> "(:[arg]) =>" }
```

The first rewrite rule `rewrite :[fn] { "function(:[args])" -> "(:[args]) =>" },` will convert `function(){}` style to
fat arrow style. And the second rewrite line `rewrite :[fn] { ":[[arg]] =>" -> "(:[arg]) =>" }` converts single argument
un-parenthesized fat arrow style to parenthesized fat arrow style (`_ => {}` to `(_) => {}`).

![Eslint rules and auto fixing could probably be used to perform the same task outside of comby, but this is a useful exercise](/imgs/posts/2022-10-03-fig6.png)

Okay, now that we've got consistent function definitions, handling context parameters in test invocations is almost
identical to the before case. we just change `before` to `test` in our matcher, and we convert the rest of the
functions.

*Match Template*

```
test(:[scenario], async (:[ctx]) => {:[rest]})
```

Normally, I would have wanted to use an `:[async]`  hole -- but Comby isn't behaving as expected for this pattern. I
think I actually ran into a potential bug here. To work around it, I'll just handle fixing async and non async functions
separately, not a big deal. Non-async template is simply `test(:[scenario], (:[ctx]) => {:[rest]})`

*Rewrite Template*

```
test(:[scenario], async () => {:[rest]})
```

And the non-async rewrite template is `test(:[scenario], () => {:[rest]})`

*Rule Template*

```
where 
rewrite :[ctx] { "_" -> "ctx" },
rewrite :[rest] { ":[ctx]." -> "context." },
rewrite :[rest] { :[before~[^a-zA-Z0-9]]:[ctx]:[after~[^a-zA-Z0-9]] -> ":[before]context:[after]" }
```

The rule template is the same for both sync and async functions. The first rewrite
expression `rewrite :[ctx] { "_" -> "ctx" },` is goofy. Again, I think this might be a bug, but the behavior for
functions with `_` for the context name was wonky, it matched against spaces in the proceeding rewrite expressions. So
just changing it to a non `_` value resolved the issue. The remaining two expressions are just the same from when I
handled the `before` function scenario. Rewrite the context variable when referenced w/ an accessor `.` or when
referenced but not part of a longer variable name.
![figure 7](/imgs/posts/2022-10-03-fig7.png)

![figure 8](/imgs/posts/2022-10-03-fig8.png)

The last pieces I need to deal with are assertions. I'll be mapping assertions from the `uvu/assert` library
to `jest/expect`. I needed to identify each "type" of assertion being used in the test cases, so I used my editor's find
in files functionality to get a list of lines that match "assert.". For this demonstration, I'll limit it to the
assertions in the example file.

In our sample file, we assertions in the form of  `assert.ok(/*..*/)`, `assert.type(/*..*/)`.

Assert.ok simply makes sure the value is truthy, which is equivalent of `expect(/*..*/).toBeTruthy()`. So I'll fix those
assertions first:
*Match Template*

```
assert.ok(:[params])
```

Pretty simple in comparison to what I did to fix the test structure. Find assert.ok's and use the `:[params]` hole to
capture the parameters.

*Rewrite Template*

```
expect(:[params]).toBeTruthy()
```

Then just plop the parameters into the equivalent Jest expectation format. Note the *Rule Template* for all of these
will just be `where true` nothing fancy is needed.

![figure 9](/imgs/posts/2022-10-03-fig9.png)

Simple enough. Now I'll address Assert.type -- this assertion checks that the `typeof` a value matches an expectation, we
can do the equivalent check with expect as `expect(typeof value).toBe('expectation')`. The templates for that:
*Match Template*

```
assert.type(:[value], :[compare])
```

*Rewrite Template*

```
expect(typeof :[value]).toBe(:[compare])
```

Easy peasy!
![figure 10](/imgs/posts/2022-10-03-fig10.png)

Here's the test file with all the changes.

```
import {before, describe, expect, test} from '@jest/globals';
import { gql } from 'graphql-request';
import { request } from '../utils';

describe('fruits list', () => {
  const context = {};
  before(async () => {
    const query = gql`
      query Lists {
        Fruits
      }
    `;
  
    context.responseData = await request({ query });
  });
  
  test('Should return array of strings',  () => {
    const { Fruits } = ctx;
    expect(Array.isArray(Fruits)).toBeTruthy();
    Fruits(f => {
      expect(typeof f).toBe('string');
    });
  });
  
  test('Should not have errors in the response', async  () => {
    expect(c.responseData.errors === undefined).toBeTruthy();
  });
  
  test('test', async  () => {
    expect('it works').toBeTruthy();
  });
});
```

All and all, I did end up having to write some pretty complex rewrite expressions and get creative with my match and
rewrite templates. But I found the process of crafting those things much easier than it would have been with pure regex.
The fact that Comby understands balanced brackets and code blocks, makes group captures pretty easy to write.
Ultimately, I found the tool to be very powerful. It's not as impressive when applied to a single file for demonstration
purposes, but when I was apply to apply my patterns to my entire test directory and it just worked it felt incredible.

I hope you've found this walk through entertaining, if not instructive. And I hope I've peeked your desire to try Comby
for yourself. You can visit [comby.dev](comby.dev) to learn more about comby and [comby.live](comby.live) for an
interactive web UI playground. If you thought the editor in my screenshots looked interesting, you might be interested
in trying my desktop app [GUI 4 Comby](https://github.com/formidableLabs/gui4comby).

