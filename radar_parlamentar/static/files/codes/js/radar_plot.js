/*##############################################################################
#       Copyright (C) 2013  Diego Rabatone Oliveira, Leonardo Leite,           #
#                           Saulo Trento                                       #
#                                                                              #
#    This program is free software: you can redistribute it and/or modify      #
# it under the terms of the GNU Affero General Public License as published by  #
#      the Free Software Foundation, either version 3 of the License, or       #
#                     (at your option) any later version.                      #
#                                                                              #
#       This program is distributed in the hope that it will be useful,        #
#       but WITHOUT ANY WARRANTY; without even the implied warranty of         #
#        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         #
#             GNU Affero General Public License for more details.              #
#                                                                              #
#  You should have received a copy of the GNU Affero General Public License    #
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.     #
##############################################################################*/

// Versão para o hackathon cdep 2013

Plot = (function ($) {

    // Function to load the data and draw the chart
    function initialize(nome_curto_casa_legislativa) {
        //d3.json("/analises/analise/" + nome_curto_casa_legislativa + "/json_pca", _plot_data);
        //para testes com arquivo hardcoded
//        d3.json("/static/files/partidos.json", plot_data);
        d3.json("/static/files/deputados.json", plot_data);
    }

    function space_to_underline(name) {
        return name.replace(/\s+/g,'_');
    }
    
    function cor(d) { return d.cor; }    
    function nome(d) { return space_to_underline(d.nome); } 
    function numero(d) { return d.numero; } 
    
    // Creates a "radialGradient"* for each circle
    // and returns the id of the just created gradient.
    // * the "radialGradient" is a SVG element
    function gradiente(svg,id,color) {
        DEFAULT_COLOR = "#1F77B4";
        if (color === "#000000") color = DEFAULT_COLOR;
        var identificador = "gradient-" + id;
        var gradient = svg.append("svg:defs")
            .append("svg:radialGradient")
            .attr("id", identificador)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
        
        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", color)
            .attr("stop-opacity", 0.5);
        
        gradient.append("svg:stop")
            .attr("offset", "70%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
        return "url(#" + identificador + ")";
    }
    
    // Chart dimensions.
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width_graph = 670,
        height_graph = 670,
        width = width_graph - margin.right - margin.left,
        height = height_graph - margin.top - margin.bottom,
        space_between_graph_and_control = 60,
        height_of_control = 80;
    var TEMPO_ANIMACAO = 500,
        RAIO_PARLAMENTAR = 6;

    // Various scales. These domains make assumptions of data, naturally.
    var xScale = d3.scale.linear().domain([-100, 100]).range([0, width]),
        yScale = d3.scale.linear().domain([-100, 100]).range([height, 0]);

    var periodo_min,
        periodo_max,
        periodo_de,
        periodo_para,
        periodo_atual,
        partidos,
        periodos,
        partidos_explodidos = [];

    // Function that draws the chart
    function plot_data(dados) {
        // Inicialmente remove o spinner de loading
        $("#loading").remove();

        // Creates the SVG container and sets the origin.
        var svg_base = d3.select("#animacao").append("svg")
            .attr("width", width + margin.left + margin.right + 200)
            .attr("height", height + margin.top + margin.bottom + space_between_graph_and_control)
            .style("position", "relative");

        var grupo_controle_periodos = svg_base.append("g")
            .attr("width", width)
            .attr("height", height_of_control)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

         grupo_grafico = svg_base.append("g")
            .attr("id", "grupo_grafico")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + "," + (margin.top + space_between_graph_and_control ) + ")");

        addBackground(grupo_grafico);

        var label_periodo = grupo_controle_periodos.append("text")
            .attr("class", "year label")
            .attr("text-anchor", "middle")
            .attr("y", 30 )
            .attr("x", width/2)

        var label_nvotacoes = grupo_controle_periodos.append("text")
            .attr("class", "total_label")
            .attr("text-anchor", "middle")
            .attr("y", "48")
            .attr("x", width/2)

        var go_to_previous = grupo_controle_periodos.append("text")
            .attr("id", "previous_period")
            .attr("class", "previous")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .attr("x", 10)
            .text("<");

        var go_to_next = grupo_controle_periodos.append("text")
            .attr("id", "next_period")
            .attr("class", "next")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .attr("x", width-10 )
            .text(">");
        
        // setando variáveis já declaradas
        partidos = dados.partidos;
        periodos = dados.periodos;
        periodo_min = 0;
        periodo_max = periodos.length-1;
        periodo_atual = periodo_min;
        periodo_para = periodo_atual;
        periodo_de = periodo_atual;        
        
        configure_go_to_next();
        configure_go_to_previous();

        change_period();

        // ############## Funções de controle de mudanças de estado ###########
        
        // Função que controla mudança de estado para o estado seguinte
        function configure_go_to_next() {
            go_to_next
                .on("mouseover", mouseover_next)
                .on("mouseout", mouseout_next)
                .on("click", change_to_next_period);
        }

        // Função que controla a mudança de estado para o estado anterior
        function configure_go_to_previous() {
            go_to_previous
                .on("mouseover", mouseover_previous)
                .on("mouseout", mouseout_previous)
                .on("click", change_to_previous_period);
        }
        
        function change_to_next_period() {
            periodo_de = periodo_atual;
            periodo_para = periodo_atual + 1;
            if (periodo_para > periodo_max)
                periodo_para = periodo_max;
            periodo_atual = periodo_para;
            change_period();
        }

        function change_to_previous_period() {
            periodo_de = periodo_atual;
            periodo_para = periodo_atual - 1;
            if (periodo_para < periodo_min)
                periodo_para = periodo_min;
            periodo_atual = periodo_para;
            change_period();
        }
        
        function change_period() {
            atualiza_grafico(false);
        }
        
        // atualiza partidos e deputados no gráfico de acordo com o período atual
        // explodindo: true quando estamos atualizando o gráfico por causa de uma explosão de partido
        // (explosão de partido é quando se clica no partido para ver seus parlamentares)
        function atualiza_grafico(explodindo) {
            partidos_no_periodo = get_partidos_no_periodo(periodo_atual);

            var parties = grupo_grafico.selectAll('.party').data(partidos_no_periodo, function(d) { return d.nome });
            var circles = grupo_grafico.selectAll('.party_circle').data(partidos_no_periodo, function(d) { return d.nome });

            parties.transition()
                .attr("transform", function(d) { return "translate(" + xScale(d.x[periodo_para]) +"," +  yScale(d.y[periodo_para]) + ")" })
                .duration(TEMPO_ANIMACAO);
            
            circles.transition()
                .attr("r", function(d) { return d.r[periodo_para]})
                .duration(TEMPO_ANIMACAO);

            var new_parties = parties.enter().append("g")
                .attr("class","party")
                .attr("id",function(d){return "group-"+nome(d);})
                .attr("transform", function(d) { return "translate(" + xScale(d.x[periodo_atual]) +"," +  yScale(d.y[periodo_atual]) + ")";})
                .attr("opacity",0.00001)
                .on("click", function(d) { return explode_partido(d); });
            
            new_parties.append("title")
                .text(function(d) { return nome(d); });
    
            var new_circles = new_parties.append("circle")
                .attr("class","party_circle")
                .attr("id", function(d) { return "circle-" + nome(d); })
                .attr("r", 0)
                .attr("fill", function(d) {return gradiente(grupo_grafico, nome(d), cor(d)); });

            new_parties.append("text")
                .attr("text-anchor","middle")
                .attr("dy",3)
                .text(function(d) { return numero(d); });

            new_parties.transition()
                .attr("opacity",1)
                .duration(TEMPO_ANIMACAO);
            new_circles.transition()
                .attr("r", function(d) { return d.r[periodo_atual]; });
            
            circles.exit().transition().duration(TEMPO_ANIMACAO).attr("r",0).remove();
            parties.exit().transition().duration(TEMPO_ANIMACAO).remove();

            // Tratar parlamentares (pontos), um partido por vez:
            partidos.forEach(function(partido) {
                if (jQuery.inArray(partido,partidos_explodidos) == -1)
                    var parlamentares_no_periodo = []; // não é para ter dados de parlamentares se o partido não estiver explodido.
                else
                    var parlamentares_no_periodo = get_parlamentares_no_periodo(partido, periodo_atual);

                // DATA-JOIN dos parlamentares deste partido:
                var parlamentares = grupo_grafico.selectAll('.parlamentar_circle.partido_' + nome(partido))
                    .data(parlamentares_no_periodo, function(d) { return nome(d) });

                parlamentares.transition()
                             .duration(TEMPO_ANIMACAO)
                             .attr("cx", function(d) { return xScale(d.x[periodo_para]); })
                             .attr("cy", function(d) { return yScale(d.y[periodo_para]); });

                var new_parlamentares = parlamentares.enter().append("circle")
                    .attr("class",["parlamentar_circle partido_" + nome(partido)] )
                    .attr("id", function(d) { return "point-" + nome(d); })
                    .attr("r", RAIO_PARLAMENTAR)
                    .attr("fill", cor(partido))
                    .on("click", function(d) { return implode_partido(partido); });

                new_parlamentares.append("title").text(function(d) { return d.nome; });
                    
                if (explodindo) {
                    new_parlamentares.attr("cx", xScale(partido.x[periodo_atual]))
                                     .attr("cy", yScale(partido.y[periodo_atual]))
                                     .transition().duration(TEMPO_ANIMACAO)
                                                  .attr("cx", function(d) { return xScale(d.x[periodo_atual]); })
                                                  .attr("cy", function(d) { return yScale(d.y[periodo_atual]); });

                    parlamentares.exit()
                        .attr("cx", function(d) { return xScale(d.x[periodo_atual]); })
                        .attr("cy", function(d) { return yScale(d.y[periodo_atual]); })
                        .transition().duration(TEMPO_ANIMACAO)
                                     .attr("cx", xScale(partido.x[periodo_atual]))
                                     .attr("cy", yScale(partido.y[periodo_atual]))
                        .remove();
                } else {
                    new_parlamentares.attr("cx", function (d) { return xScale(d.x[periodo_para]); })
                                     .attr("cy", function (d) { return yScale(d.y[periodo_para]); })
                                     .attr("r",0);
                    new_parlamentares.transition()
                                     .duration(TEMPO_ANIMACAO)
                                     .attr("r", RAIO_PARLAMENTAR);

                    parlamentares.exit().transition().duration(TEMPO_ANIMACAO).attr("r",0).remove();
                }
            });            
            
            label_periodo.text(periodos[periodo_atual].nome);
            quantidade_votacoes = periodos[periodo_atual].nvotacoes;
            label_nvotacoes.text(quantidade_votacoes + " votações"); 
            
            sortAll();
            
            if (periodo_para == periodo_max) go_to_next.classed("active", false);
            if (periodo_para == periodo_min) go_to_previous.classed("active", false);
        }

        function mouseover_next() {
            if (periodo_atual < periodo_max) go_to_next.classed("active", true);
        }

        function mouseout_next() {
            go_to_next.classed("active", false);
        }

        function mouseover_previous() {
            if (periodo_atual > periodo_min) go_to_previous.classed("active", true);
        }

        function mouseout_previous() {
            go_to_previous.classed("active", false);
        }
        
        function sortAll() {
            var partidos = grupo_grafico.selectAll(".party")
            partidos.sort(order);
        }

        function explode_partido(partido) { //partido é o json do partido
            partidos_explodidos.push(partido);
            atualiza_grafico(true);
        }
        
        function implode_partido(partido) { //partido é o json do partido
            remove_from_array(partidos_explodidos,partido);
            atualiza_grafico(true);
        }

        // remove o elemento de valor el da array lista, e retorna a lista modificada
        function remove_from_array(lista,el) {
            for(var i = lista.length - 1; i >= 0; i--) {
                if(lista[i] === el) {
                    lista.splice(i, 1);
                }
            }
            return lista;
        }

        // Defines a sort order so that the smallest parties are drawn on top.
        function order(a, b) {
            if (a == null || b == null) console.log(parties, a, b);
            return b.t[periodo_atual] - a.t[periodo_atual];
        }        

        // Retorna partidos excluindo partidos ausentes no período e partidos explodidos
        function get_partidos_no_periodo(period) {
            return partidos.filter(function(d){ return d.t[period] > 0 && jQuery.inArray(d,partidos_explodidos) == -1;});
        }
        
        // Retorna o json de parlamentares do partido, do qual foram excluídos parlamentares ausentes no dado period.
        function get_parlamentares_no_periodo(partido, period) {
            return partido.parlamentares.filter(function (d) {return d.x[periodo_atual] !== null; })
        }
    }

    function addBackground(grupo_grafico) {
        var fundo = grupo_grafico.append("g")
            .attr("transform","translate(" + width/2 + "," + height/2 + ")");

        raio_fundo = Math.min(width,height)/2;

        fundo.append("circle")
            .attr("class", "radar_background")
            .attr("r", raio_fundo);

        var raio = 10;
        while (raio < raio_fundo) {
            fundo.append("circle")
                .attr("class", "raio_radar")
                .attr("r",raio);
            raio = raio + 40;
        }
    }

    return {
        initialize:initialize
    };
})(jQuery);