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
    menus: [{ id: "1", text: "供应商管理", icon: "fa fa-suitcase", link: "SupplierList", component: SupplierList }, { id: "2", text: "客户管理", icon: "fa fa-user", link: "ClientList", component: ClientList }, { id: "3", text: "产品入库", icon: "fa fa-inbox", link: "SupplierList", component: SupplierList }, { id: "4", text: "产品出库", icon: "fa fa-dropbox", link: "SupplierList", component: SupplierList }, { id: "5", text: "库存统计", icon: "fa fa-pie-chart", link: "SupplierList", component: SupplierList }]
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

ReactDOM.render(React.createElement(
    Router,
    { history: hashHistory },
    React.createElement(
        Route,
        { path: '/', component: App },
        React.createElement(IndexRoute, { component: Dashboard }),
        routers,
        React.createElement(Route, { path: 'provider_add', component: SupplierAdd }),
        React.createElement(Route, { path: 'provider_edit(/:id)', component: SupplierEdit }),
        React.createElement(Route, { path: 'product_list(/:id)', component: ProductList }),
        React.createElement(Route, { path: 'product_add(/:prov_id)', component: ProductAdd }),
        React.createElement(Route, { path: 'product_edit(/:prod_id)', component: ProductEdit }),
        React.createElement(Route, { path: 'client_add', component: ClientAdd }),
        React.createElement(Route, { path: 'client_edit(/:cli_id)', component: ClientEdit })
    )
), document.querySelector("#desktop"));
