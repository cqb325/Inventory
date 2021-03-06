const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;

const SupplierList = require('./supplier/list');
const SupplierAdd = require('./supplier/add');
const SupplierEdit = require('./supplier/edit');

const ProductList = require('./products/list');
const ProductAdd = require('./products/add');
const ProductEdit = require('./products/edit');

const ClientList = require('./client/list');
const ClientAdd = require('./client/add');
const ClientEdit = require('./client/edit');

const ImportList = require('./orderin/list');
const ImportAdd = require('./orderin/add');
const ImportBack = require('./orderin/back');
const ImportBackList = require('./orderin/backList');
const ImportPayFund = require('./orderin/payFund');

const ExportList = require('./orderout/list');
const ExportAdd = require('./orderout/add');
const ExportBorrow = require('./orderout/borrow');
const InnerBorrow = require('./orderout/borrowList');
const ExportFund = require('./orderout/payFund');

const InventoryList = require('./inventory/list');
const InventoryDetail = require('./inventory/detail');
const InventoryFund = require('./inventory/fund');

const StaffList = require('./staff/list');
const StaffAdd = require('./staff/add');
const StaffEdit = require('./staff/edit');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const hashHistory = ReactRouter.hashHistory;
const Route = ReactRouter.Route;
const IndexRoute = ReactRouter.IndexRoute;
const Link = ReactRouter.Link;
const IndexLink = ReactRouter.Link;

const database = require("./db/db");
Object.assign(global, database);

const APP = {
    sysName: "CLY",
    menus: [{ id: "1", text: "供应商管理", icon: "fa fa-suitcase", link: "SupplierList", component: SupplierList }, { id: "6", text: "产品管理", icon: "fa fa-suitcase", link: "ProductList", component: ProductList }, { id: "2", text: "客户管理", icon: "fa fa-user", link: "ClientList", component: ClientList }, { id: "3", text: "入库管理", icon: "fa fa-inbox", children: [{ id: "31", text: "产品采购", icon: "fa fa-dropbox", link: "ImportList", component: ImportList }, { id: "32", text: "内部归还", icon: "fa fa-mail-reply-all", link: "import_backList", component: ImportBackList }] }, { id: "4", text: "出库管理", icon: "fa fa-dropbox", children: [{ id: "41", text: "产品销售", icon: "fa fa-dropbox", link: "ExportList", component: ExportList }, { id: "42", text: "内部借用", icon: "fa fa-dropbox", link: "inner_borrow", component: InnerBorrow }] }, { id: "5", text: "库存统计", icon: "fa fa-pie-chart", children: [{ id: "51", text: "库存产品", icon: "fa fa-dropbox", link: "InventoryList", component: InventoryList }, { id: "52", text: "库存资产", icon: "fa fa-dropbox", link: "InventoryFund", component: InventoryFund }] }, { id: "7", text: "员工管理", icon: "fa fa-suitcase", link: "StaffList", component: StaffList }]
};

const SideBar = require("./lib/SideBar");

const App = React.createClass({
    displayName: 'App',

    render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                SideBar,
                { data: APP.menus, style: { width: '200px' }, logo: '../assets/imgs/logo.png', header: APP.sysName },
                this.props.children
            )
        );
    }
});

let routers = [];
APP.menus.map(function (item, index) {
    if (item.children) {
        item.children.forEach(function (subItem, subIndex) {
            routers.push(React.createElement(Route, { key: subIndex, path: subItem.link, component: subItem.component }));
        });
    }
    routers.push(React.createElement(Route, { key: index, path: item.link, component: item.component }));
});

let Dashboard = React.createClass({
    displayName: 'Dashboard',

    render() {
        return React.createElement(
            'div',
            null,
            'Welcome to the app!'
        );
    }
});

window.APP_ROUTER = ReactDOM.render(React.createElement(
    Router,
    { history: hashHistory },
    React.createElement(
        Route,
        { path: '/', component: App },
        React.createElement(IndexRoute, { component: Dashboard }),
        routers,
        React.createElement(Route, { path: 'provider_add', component: SupplierAdd }),
        React.createElement(Route, { path: 'provider_edit(/:id)', component: SupplierEdit }),
        React.createElement(Route, { path: 'product_add(/:prov_id)', component: ProductAdd }),
        React.createElement(Route, { path: 'product_edit(/:prod_id)', component: ProductEdit }),
        React.createElement(Route, { path: 'client_add', component: ClientAdd }),
        React.createElement(Route, { path: 'client_edit(/:cli_id)', component: ClientEdit }),
        React.createElement(Route, { path: 'import_add', component: ImportAdd }),
        React.createElement(Route, { path: 'import_back(/:ord_no)', component: ImportBack }),
        React.createElement(Route, { path: 'import_payFund(/:ord_no)', component: ImportPayFund }),
        React.createElement(Route, { path: 'export_add', component: ExportAdd }),
        React.createElement(Route, { path: 'export_borrow', component: ExportBorrow }),
        React.createElement(Route, { path: 'export_payFund(/:ord_no)(/:type)', component: ExportFund }),
        React.createElement(Route, { path: 'inventory_detail(/:prod_id)', component: InventoryDetail }),
        React.createElement(Route, { path: 'staff_add', component: StaffAdd }),
        React.createElement(Route, { path: 'staff_edit(/:staff_id)', component: StaffEdit })
    )
), document.querySelector("#desktop"));
