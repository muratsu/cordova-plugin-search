var Stars = React.createClass({
    render: function() {
        return (
            <li>
                <div>
                    {this.props.plugin.name} - Rating: {
                        Math.round(this.props.plugin.rating)
                    }<br></br>
                    {this.props.plugin.description}
                </div>
            </li>
        )
    }
})

var SearchBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value
        )
    },
    render: function() {
        return (
            <div>
                <input
                    placeholder={this.props.placeHolderText}
                    value={this.props.filterText}
                    ref="filterTextInput"
                    onChange={this.handleChange}
                />
            </div>
        );
    }
})

var Plugin = React.createClass({
    render: function() {
        return (
            <li>
                <div>
                    {this.props.plugin.name} - Rating: {
                        Math.round(this.props.plugin.rating)
                    }<br></br>
                    {this.props.plugin.description}
                </div>
            </li>
        )
    }
})

var PluginList = React.createClass({
    render: function() {
        var plugins = [];
        this.props.plugins.forEach(function(plugin) {
            if (plugin.name.indexOf(this.props.filterText) > -1) {
                plugins.push(<Plugin plugin={plugin} key={plugin.author + plugin.name}/>);
            }
        }.bind(this));
        return (
            <ul>
                {plugins}
            </ul>
        );
    }
});


var CordovaPluginList = React.createClass({
    getInitialState: function() {
        return {
            plugins: [],
            filterText: '',
            placeHolderText: 'Loading...'
        };
    },
    handleUserInput: function(filterText) {
        this.setState({
            filterText: filterText
        });
    },

    componentDidMount: function() {
        var plugins = [],
            pluginCount = 0,
            self = this;

        xhrRequest("http://npmsearch.com/query?fields=name,keywords,rating,description,author,modified,homepage,version&q=keywords:%22ecosystem:cordova%22&size=20&sort=rating:desc&start=0", function(xhrResult) {
            plugins = xhrResult.results;
            pluginCount = xhrResult.total;
            xhrRequest("http://npmsearch.com/query?fields=name,keywords,rating,description,author,modified,homepage,version&q=keywords:%22ecosystem:cordova%22&size=" + (pluginCount - 20) + "&sort=rating:desc&start=20", function(xhrResult) {
                plugins = [].concat(plugins, xhrResult.results);
                if (this.isMounted()) {
                    this.setState({
                      plugins: plugins,
                      placeHolderText: 'Search ' + pluginCount + ' plugins...'
                    });
                }
            }.bind(self), function() { console.log('xhr err'); });
        }, function() { console.log('xhr err'); });
    },

    render: function() {
        return (
            <div>
                <SearchBar
                    filterText={this.state.filterText}
                    placeHolderText={this.state.placeHolderText}
                    onUserInput={this.handleUserInput}
                />
                <PluginList
                    plugins={this.state.plugins}
                    filterText={this.state.filterText}
                />
            </div>
        );
    }
});

React.render(
    <CordovaPluginList />,
    document.getElementById('container')
)

function xhrRequest(url, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE ) {
            if(xhr.status == 200){
                success(JSON.parse(xhr.responseText));
                return;
            } else {
                fail();
                return;
            }
        }
    }.bind(this)
    xhr.open("GET", url, true);
    xhr.send();
}
