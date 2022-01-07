#Doctrine/ORM - Here be dragons

Doctrine is one of the many PHP package I've taken for granted over the last year. I've counted it as a solid and reliable abstraction layer for my persistence. I'm now finally disillusioned to the notion of it being infallible. That's not say that I actually thought it was bug free in the first place but I was doing a darn fine job of not thinking about its bugs and failures -- really just avoiding the topic as a whole perhaps subconsciously. I guess it's a side effect, or maybe even trap, of using existing packages to solve the pesky implementation details. 

If you're actually using Doctrine2, have you actually taken a look at the issue tracker on github? I had not previously taken the time to really look at it, at the number of issues and the type of issues previously. Presently, there are `435` open issues marked with the `Bug` label. That is not to say that it is bad software or that the maintainers are doing a bad job (quite the contrary as there are `2244` closed bug issues). But it stands as a reminder that the package has a magnitude of issues. 

What is interesting, is that the package works for most of the "core" functionality. Things like persistence of entities, associations and the like. It is the extraneous features when you start getting into troubled waters. 

Last week, I wanted to utilize collections w/ criteria for filtering associations. Specifically, I had an Therapist entity with a unidirectional many-to-many association to facilities and I wanted to get a list of those facilities matching a specified name. The "typical" solution that would probably be suggested on stack overflow might be to write a custom repository method to fetch the facility using a DQL statement and returning the result, maybe utilizing a paginator. But doctrine boasts a feature where if you define your associations as `extra-lazy` then when you access the association property you'll receive a proxy collection that waits until you iterate over it to fetch the data from the database. Additionally, the collection supposedly supports filtering by providing a `Criteria` object that defines conditionals/orderings. Unfortunately through trial an error I discovered that the `ManyToManyPersister` which is responsible for providing this functionality suffers from 5 separate, compounding bugs.

  * Collection of a non-owning side  association was broken
  * Limit/offset of Criteria were being ignored
  * OrderBy of criteria was being ignored
  * field to column name mappings were being ignored
  * all the where conditionals of the criteria were being treated as `Equal To operation` meaning if your where clause was "count > 3" it was treated as "count = 3".
  
While not a bug, the implementation detail of the `matching` method that applies to the PersistentCollection and returns a new "filtered" ArrayCollection with the entire result hydrated in memory. I'd prefer if it returned another PersistentCollection that didn't hydrate until you iterated over it.

Currently, there are pull requests to address the first four of the above bug list -- so they will likely be addressed eventually. But for right now, it means the criteria solution is just off the table. 

At the very least, I've now got extra motivation to contribute back to open source software as this is a package I like using and a feature I'd really like to make use of. So I'll probably pick up the hammer and see if I can patch up some of this fuckiness with a pull request of my own.
