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

var SupportedPlatforms = React.createClass({
    render: function() {
        var keywords = this.props.keywords;
        var platformsSupported = [];
        // remove windows8 & windows dupe
        if (keywords.indexOf('cordova-windows') > -1 && keywords.indexOf('cordova-windows8') > -1) {
            keywords.splice(keywords.indexOf('cordova-windows8'), 1);
        }
        keywords.forEach(function(keyword) {
            switch (keyword) {
                case 'cordova-firefoxos':
                    platformsSupported.push(<div>FirefoxOS</div>);
                    break;
                case 'cordova-android':
                    platformsSupported.push(<div>Android</div>);
                    break;
                case 'cordova-amazon-fireos':
                    platformsSupported.push(<div>FireOS</div>);
                    break;
                case 'cordova-ubuntu':
                    platformsSupported.push(<div>Ubuntu</div>);
                    break;
                case 'cordova-ios':
                    platformsSupported.push(<div>iOS</div>);
                    break;
                case 'cordova-blackberry10':
                    platformsSupported.push(<div>Blackberry10</div>);
                    break;
                case 'cordova-wp7':
                    platformsSupported.push(<div>Windows Phone 7</div>);
                    break;
                case 'cordova-wp8':
                    platformsSupported.push(<div>Windows Phone 8</div>);
                    break;
                case 'cordova-windows8':
                case 'cordova-windows':
                    platformsSupported.push(<div>Windows</div>);
                    break;
                case 'cordova-browser':
                    platformsSupported.push(<div>Browser</div>);
                    break;
            }
        });
        return (
            <div id="supportedPlatforms">{platformsSupported}</div>
        );
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
            <div className="col-xs-offset-2 col-xs-8">
                <div id="searchwrapper">
                    <input
                        className="searchBox"
                        placeholder={this.props.placeHolderText}
                        value={this.props.filterText}
                        ref="filterTextInput"
                        onChange={this.handleChange}
                    />
                </div>
            </div>
        );
    }
})

var Plugin = React.createClass({
    render: function() {
        return (
            <li>
                <div>
                    <div id="pluginName"><a href={this.props.plugin.homepage}>{this.props.plugin.name}</a></div>
                    <div id="pluginDesc">{this.props.plugin.description}</div>
                    <div>
                        Author: {this.props.plugin.author} (v{this.props.plugin.version} - {this.props.plugin.license})
                    </div>
                    <SupportedPlatforms keywords={this.props.plugin.keywords}/>
                </div>
            </li>
        )
    }
})

var PluginList = React.createClass({
    render: function() {
        var plugins = [];
        this.props.plugins.forEach(function(plugin) {
            if (plugin.name[0].indexOf(this.props.filterText) > -1) {
                plugins.push(<Plugin plugin={plugin} key={plugin.author + plugin.name}/>);
            }
        }.bind(this));
        return (
            <div className="col-xs-offset-2 col-xs-8">
                <ul id="pluginList">
                    {plugins}
                </ul>
            </div>
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

        xhrRequest("http://npmsearch.com/query?fields=name,keywords,license,description,author,modified,homepage,version&q=keywords:%22ecosystem:cordova%22&size=20&start=0", function(xhrResult) {
            plugins = xhrResult.results;
            pluginCount = xhrResult.total;
            xhrRequest("http://npmsearch.com/query?fields=name,keywords,license,description,author,modified,homepage,version&q=keywords:%22ecosystem:cordova%22&size=" + (pluginCount - 20) + "&start=20", function(xhrResult) {
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
            <div className="row">
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
