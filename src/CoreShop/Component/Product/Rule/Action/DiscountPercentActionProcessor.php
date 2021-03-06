<?php
/**
 * CoreShop.
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015-2017 Dominik Pfaffenbauer (https://www.pfaffenbauer.at)
 * @license    https://www.coreshop.org/license     GNU General Public License version 3 (GPLv3)
*/

namespace CoreShop\Component\Product\Rule\Action;

use CoreShop\Component\Product\Model\ProductInterface;
use Webmozart\Assert\Assert;

class DiscountPercentActionProcessor implements ProductPriceActionProcessorInterface
{
    /**
     * {@inheritdoc}
     */
    public function getDiscount($subject, $price, array $configuration)
    {
        Assert::isInstanceOf($subject, ProductInterface::class);

        return (int) round(($configuration['percent'] / 100) * $price);
    }

    /**
     * {@inheritdoc}
     */
    public function getPrice($subject, array $configuration)
    {
        return null;
    }
}
