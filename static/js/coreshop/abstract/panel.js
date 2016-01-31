/**
 * CoreShop
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015 Dominik Pfaffenbauer (http://dominik.pfaffenbauer.at)
 * @license    http://www.coreshop.org/license     GNU General Public License version 3 (GPLv3)
 */


pimcore.registerNS("pimcore.plugin.coreshop.abstract.panel");

pimcore.plugin.coreshop.abstract.panel = Class.create({

    layoutId: "abstract_layout",
    storeId : "abstract_store",
    iconCls : "coreshop_abstract_icon",
    type : "abstract",

    url : {
        add : "",
        delete : "",
        get : "",
        list : ""
    },

    initialize: function() {
        // create layout
        this.getLayout();

        this.panels = [];
    },

    activate: function () {
        var tabPanel = Ext.getCmp("pimcore_panel_tabs");
        tabPanel.setActiveItem( this.layoutId );
    },

    getLayout: function () {
        if (!this.layout) {

            // create new panel
            this.layout = new Ext.Panel({
                id: this.layoutId,
                title: t("coreshop_" + this.type),
                iconCls: this.iconCls,
                border: false,
                layout: "border",
                closable: true,
                items: this.getItems()
            });

            // add event listener
            var layoutId = this.layoutId;
            this.layout.on("destroy", function () {
                pimcore.globalmanager.remove(layoutId);
            }.bind(this));

            // add panel to pimcore panel tabs
            var tabPanel = Ext.getCmp("pimcore_panel_tabs");
            tabPanel.add(this.layout);
            tabPanel.setActiveItem(this.layoutId);

            // update layout
            pimcore.layout.refresh();
        }

        return this.layout;
    },

    getItems : function() {
        return [this.getNavigation(), this.getTabPanel()];
    },

    getNavigation: function () {
        if (!this.grid) {


            this.grid = Ext.create('Ext.grid.Panel', {
                region: "west",
                store: pimcore.globalmanager.get(this.storeId),
                columns: [
                    {
                        text: '',
                        dataIndex: 'text',
                        flex : 1,
                        renderer: function( value, metadata, record )
                        {
                            metadata.tdCls = record.get("iconCls") + " td-icon";

                            return value;
                        }
                    }
                ],
                listeners : this.getTreeNodeListeners(),
                useArrows: true,
                autoScroll: true,
                animate: true,
                containerScroll: true,
                width: 200,
                split: true,
                tbar: {
                    items: [
                        {
                            // add button
                            text: t("coreshop_"+this.type+"_add"),
                            iconCls: "pimcore_icon_add",
                            handler: this.addItem.bind(this)
                        }
                    ]
                },
                hideHeaders: true
            });

            this.grid.on("beforerender", function () {
                this.getStore().load();
            });

        }

        return this.grid;
    },

    getTreeNodeListeners: function () {

        return {
            "itemclick" : this.onTreeNodeClick.bind(this),
            "itemcontextmenu": this.onTreeNodeContextmenu.bind(this)
        };
    },

    onTreeNodeContextmenu: function (tree, record, item, index, e, eOpts ) {
        e.stopEvent();
        tree.select();

        var menu = new Ext.menu.Menu();
        menu.add(new Ext.menu.Item({
            text: t('delete'),
            iconCls: "pimcore_icon_delete",
            handler: this.deleteItem.bind(this, record)
        }));

        menu.showAt(e.pageX, e.pageY);
    },

    onTreeNodeClick: function (tree, record, item, index, e, eOpts ) {
        this.openItem(record.data);
    },

    addItem: function () {
        Ext.MessageBox.prompt(t('coreshop_' + this.type + '_add'), t('coreshop_'+this.type+'_enter_the_name'),
            this.addItemComplete.bind(this), null, null, "");
    },

    addItemComplete: function (button, value, object) {

        var regresult = value.match(/[a-zA-Z0-9_\-]+/);
        if (button == "ok" && value.length > 2 && regresult == value) {
            Ext.Ajax.request({
                url: this.url.add,
                params: {
                    name: value
                },
                success: function (response) {
                    var data = Ext.decode(response.responseText);

                    this.grid.getStore().reload();

                    if(pimcore.globalmanager.exists("coreshop_" + this.type)) {
                        pimcore.globalmanager.get("coreshop_" + this.type).load();
                    }

                    if(!data || !data.success) {
                        Ext.Msg.alert(t('add_target'), t('problem_creating_new_target'));
                    } else {
                        this.openItem(data.data);
                    }
                }.bind(this)
            });
        } else if (button == "cancel") {
            return;
        }
        else {
            Ext.Msg.alert(t('add_target'), t('problem_creating_new_target'));
        }
    },

    deleteItem: function (record) {
        Ext.Ajax.request({
            url: this.url.delete,
            params: {
                id: record.id
            },
            success: function () {
                this.grid.getStore().reload();

                if(pimcore.globalmanager.exists("coreshop_" + this.type)) {
                    pimcore.globalmanager.get("coreshop_" + this.type).load();
                }
            }.bind(this)
        });
    },

    openItem: function (record) {
        var panelKey = this.layoutId + record.id;

        if(this.panels[panelKey])
        {
            this.panels[panelKey].activate();
        }
        else
        {
            Ext.Ajax.request({
                url: this.url.get,
                params: {
                    id: record.id
                },
                success: function (response) {
                    var res = Ext.decode(response.responseText);

                    if(res.success) {
                        this.panels[panelKey] = new pimcore.plugin.coreshop[this.type].item(this, res.data, panelKey, this.type);
                    }
                    else {
                        //TODO: Show messagebox
                        Ext.Msg.alert(t('open_target'), t('problem_opening_new_target'));
                    }

                }.bind(this)
            });
        }
    },

    getTabPanel: function () {
        if (!this.panel) {
            this.panel = new Ext.TabPanel({
                region: "center",
                border: false
            });
        }

        return this.panel;
    }
});
