#Using DBunit with Doctrine ORM

I decided to make use of DBUnit to test my persistence implementations that utilize the Doctrine ORM framework. It was my first time, so there were a few missteps. 

DBUnit is actually a PHPUnit extension so I needed to install an additional composer package to start writing test cases that extend the DBUnit test case.

```
composer require "phpunit/dbunit"
```

Then I started by extending the DBUnit test case and stubbing the two abstract methods `getConnection` and `getDataset`. 

```php
class PostStorageTest extends \PHPUnit_Extensions_Database_TestCase
{
    protected function getConnection()
    {
        // todo get $pdo instance
        return $this->createDefaultDBConnection($pdo, ':memory:');
    }
    protected function getDataSet()
    {
        return $this->createFlatXMLDataSet(__DIR__ . '/fixtures/default_data.xml');
    }
}
```

I didn't need to stub `getDataSet` as it was a trivial implementation. Basically I just gave it an XML file that describes the starting state of the data in the test tables when tests run. So I threw in some initial records that I'll be able to use to test reads against. 

Because I'm using `Sqlite` and an in memory database, I realized I needed to use the same `PDO` instance that my `EntityManager` was using. This might not be necessary if I were using a `MySQL` db or maybe even a non-memory `Sqlite` database but with the memory option each `PDO` instance has a separate data store. So I needed to instantiate an `EntityManager`. But there is also another caveat that DBUnit expects that the schema should be initialized before the tests run (IE the tables / views / procedures etc. should already be created). This resulted in moving instantiating `EntityManager` to `setupBeforeClass`.

```php
class PostStorageTest extends \PHPUnit_Extensions_Database_TestCase
{
    /** @var  EntityManager */
    protected static $entity_manager;
    /** @var  SchemaTool */
    protected static $schema_tool;

    public static function setUpBeforeClass()
    {
        $factory = new EntityManagerFactory(['driver' => 'pdo_sqlite', 'memory' => true]);
        self::$entity_manager = $factory->create(true);
        self::$entity_manager->clear();
        self::$schema_tool = new SchemaTool(self::$entity_manager);
        self::$schema_tool->createSchema(self::$entity_manager->getMetadataFactory()->getAllMetadata());
    }

    public static function tearDownAfterClass()
    {
        self::$schema_tool->dropDatabase();
    }

    protected function getConnection()
    {
        $pdo = self::$entity_manager->getConnection()->getWrappedConnection();
        return $this->createDefaultDBConnection($pdo, ':memory:');
    }

    protected function getDataSet()
    {
        return $this->createFlatXMLDataSet(__DIR__ . '/fixtures/default_data.xml');
    }
}
```

I used `EntityManagerFactory` which is not described here, but is a simple factory that creates an EntityManager instance w/ the provided connection parameters. It just does the bare minimum to create the manager configured with the proper model paths (for the coolsurfin project). Then I utilized Doctrine's SchemaTool to create the schema for my tests. I was initially concerned here because I knew I wanted to use `doctrine migrations` to manage my database change scripts. I was worried about how I would configure and execute the migration scripts for the test database (and also how slow it would be to run through all the scripts). But I realized for testing, I don't need to worry about migrating the database instance because with the test instance I'm not concerned about keeping (and maintaining integrity of) data. Instead I can just use the current state of the schema (based on the model metadata). So I just initialize the schema using the `EntityManager` instance metadata.

I also ended up adding a drop database call in the `tearDownAfterClass`. In hindsight this might be unnecessary because other tests will have their own `EntityManager` and therefore their own PDO instance (memory). But perhaps if at a later date I switched to a persistent MySQL test instance, then I know the test will clean up after itself.

With the setup of the test database instance complete I was then able to write my first test method.

```php
class PostStorageTest extends \PHPUnit_Extensions_Database_TestCase
{
    // other member variables
    /** @var  PostStorageInterface */
    protected $storage;

    // previous discussed setupBeforeClass/teardownAfterClass/getConnection/getDataset methods

    protected function setUp()
    {
        $this->storage = new PostStorage(self::$entity_manager);
        parent::setUp();
    }

    public function test_it_persists_model(){
        $post = new Post();
        $post->setAuthor('joe');
        $post->setContent('hello world');
        $post->setCreated(new DateTime('2010-04-24 17:15:23', new DateTimeZone('UTC')));
        $this->storage->save($post);

        $this->assertNotEmpty($post->getId());
        $queryTable = $this->getConnection()->createQueryTable(
            'posts', 'SELECT * FROM posts'
        );
        $expectedTable = $this->createFlatXMLDataSet(__DIR__ . '/fixtures/persisted_post.xml')
            ->getTable("posts");
        $this->assertTablesEqual($expectedTable, $queryTable);
    }
}
```

I placed instantiating the concrete Storage implementation in the `setUp` method because that code won't change and will be necessary for each test. I then wrote my test using the storage instance like I would use it in real source code. I also created another data fixture for what the table data should contain after the new model was persisted. I learned an interesting thing here that wasn't quite documented. When defining row data in the fixtures, the data has to be provided with the columns in the order that they will come back in the query result. As the `assertTablesEqual` doesn't consider data tables with the same data but different column order as equal. That probably makes since in cases where the code references result columns by index # (shitty!) but makes it kind of a pain to make sure the fixture data is in the correct column order.  

All in all the experience of setting up this test case was not difficult. The biggest stumbling block was the incorrect first inclination to use the migrations process to setup the schema for tests. After I realized I should just use the current state described the models, everything worked it self out quite nicely. Even debugging the issue with data set column order was easy as the failed expectation message was very verbose and useful. It rendered both the expected and actual data tables on screen and it was immediately clear what the problem was. 


These notes reference the [coolsurfin repository](https://github.com/jeremygiberson/coolsurfin) and the [PostStorageTest](https://github.com/jeremygiberson/coolsurfin/blob/master/tests/integration/Api/V1/Storage/PostStorageTest.php) specifically. Feel free to check them out for more context.