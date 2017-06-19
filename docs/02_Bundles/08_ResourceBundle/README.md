# CoreShop Resource Bundle

Resource Bundle is the Heart of CoreShops Model. It handles saving/deleting/updating/creating of CoreShop Models. It handles
Doctrine ORM Mappings and Translations. As well as Routing, Event Dispatching, Serialization and ORM. Resource Bundle also
takes care about installation of Pimcore Class Definitions, Object Brick Definitions, Field Collection Definitions and Static Routes.

You can use Resource Bundle as base for all your Custom Pimcore Entities.

## Installation
```
composer require coreshop/resource-bundle dev-master
```

### Adding required bundles to kernel
You need to enable the bundle inside the kernel

```php
<?php

// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
        new \JMS\SerializerBundle\JMSSerializerBundle(),
        new \Okvpn\Bundle\MigrationBundle\OkvpnMigrationBundle(),

        new \CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle(),


        new \FOS\RestBundle\FOSRestBundle(),
        new \Doctrine\Bundle\DoctrineCacheBundle\DoctrineCacheBundle(),
        new \Payum\Bundle\PayumBundle\PayumBundle(),
        new \Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle(),
    );
}
```