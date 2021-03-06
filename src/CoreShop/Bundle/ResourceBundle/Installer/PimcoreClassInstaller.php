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

namespace CoreShop\Bundle\ResourceBundle\Installer;

use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Component\Pimcore\ClassInstallerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;

final class PimcoreClassInstaller implements ResourceInstallerInterface
{
    /**
     * @var KernelInterface
     */
    protected $kernel;

    /**
     * @var ClassInstallerInterface
     */
    protected $classInstaller;

    /**
     * @param KernelInterface $kernel
     * @param ClassInstallerInterface $classInstaller
     */
    public function __construct(
        KernelInterface $kernel,
        ClassInstallerInterface $classInstaller
    )
    {
        $this->kernel = $kernel;
        $this->classInstaller = $classInstaller;
    }

    /**
     * {@inheritdoc}
     */
    public function installResources(OutputInterface $output, $applicationName = null)
    {
        $parameter = $applicationName ? sprintf('%s.pimcore.classes', $applicationName) : 'coreshop.pimcore';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            $pimcoreClasses = $this->kernel->getContainer()->getParameter($parameter);
            $fieldCollections = [];
            $bricks = [];
            $classes = [];

            foreach ($pimcoreClasses as $pimcoreModel) {
                $modelName = explode('\\', $pimcoreModel['classes']['model']);
                $modelName = $modelName[count($modelName) - 1];

                if (array_key_exists("install_file", $pimcoreModel['classes'])) {
                    $type = $pimcoreModel['classes']['type'];

                    try {
                        $file = $this->kernel->locateResource($pimcoreModel['classes']['install_file']);

                        if ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT) {
                            //$this->createClass($file, $modelName, true);
                            $classes[] = [
                                'model' => $modelName,
                                'file' => $file
                            ];
                        } else if ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_FIELD_COLLECTION) {
                            $fieldCollections[] = [
                                'model' => $modelName,
                                'file' => $file
                            ];
                        } else if ($type === CoreShopResourceBundle::PIMCORE_MODEL_TYPE_BRICK) {
                            $bricks[] = [
                                'model' => $modelName,
                                'file' => $file
                            ];
                        }

                    } catch (\InvalidArgumentException $ex) {
                        //File not found, continue with next, maybe add some logging?
                    }
                }
            }

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $progress->start(count($pimcoreClasses));

            foreach ($fieldCollections as $fc) {
                $progress->setMessage(sprintf('<error>Install Fieldcollection %s (%s)</error>', $fc['model'], $fc['file']));

                $this->classInstaller->createFieldCollection($fc['file'], $fc['model']);

                $progress->advance();
            }

            foreach ($classes as $class) {
                $progress->setMessage(sprintf('<error>Install Class %s (%s)</error>', $class['model'], $class['file']));

                $this->classInstaller->createClass($class['file'], $class['model']);

                $progress->advance();
            }

            foreach ($bricks as $brick) {
                $progress->setMessage(sprintf('<error>Install Brick %s (%s)</error>', $brick['model'], $brick['file']));

                $this->classInstaller->createBrick($brick['file'], $brick['model']);

                $progress->advance();
            }

            $progress->finish();
        }
    }
}