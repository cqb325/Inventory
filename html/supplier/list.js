/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');

let List = React.createClass({
    displayName: 'List',


    render() {
        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Button,
                    { icon: 'plus', theme: 'success' },
                    '新增供应商'
                )
            ),
            React.createElement(Tile, { header: '供应商列表' })
        );
    }
});

module.exports = List;
