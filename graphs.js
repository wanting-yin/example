d3.csv("full-list.csv", function makeGraphs(error, projectsJson, fipsJson) {
        //Clean projectsJson data
        var hmdaProjects = projectsJson;
        var dateFormat = d3.time.format("%Y");
        hmdaProjects.forEach(function (d) {
            d["report_year"] = d["report_year"].toString();
            d["total_counts"] = +d["total_counts"];
            d["total_records"] = +d["total_records"];
            d["fips"] = +d["fips"];
            d["property_type"] = +d["property_type"];
            d["occupancy"] = +d["occupancy"];
        });


        //Create a Crossfilter instance
        var ndx = crossfilter(hmdaProjects);


        //Define Dimensions
        var dateDim = ndx.dimension(function (d) { return d["report_year"]; });
        var loanTypeDim = ndx.dimension(function (d) { return d["loan_type"]; });
        var preappovalLevelDim = ndx.dimension(function (d) { return d["preappoval"]; });
        var fipsDim = ndx.dimension(function (d) { return d["fips"]; });
        var totalcountsDim = ndx.dimension(function (d) { return d["total_counts"]; });
        var totalRecordsDim = ndx.dimension(function (d) { return d["total_records"]; });
        var actionTypeDim = ndx.dimension(function (d) { return d["action_type"]; });
        var propertyTypeDim = ndx.dimension(function (d) { return d["property_type"]; });
        var occupancyDim = ndx.dimension(function (d) { return d["occupancy"]; });

        //Calculate metrics
        var numProjectsByDate = dateDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var numProjectsByOccupancy = occupancyDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var numProjectsByloanType = loanTypeDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var numProjectsByactionType = actionTypeDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var numProjectsBypreappovalLevel = preappovalLevelDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var numProjectsByfips = fipsDim.group();
        var totalcountsByfips = fipsDim.group().reduceSum(function (d) {
            return d["total_counts"];
        });
        var totalRecordsByfips = fipsDim.group().reduceSum(function (d) {
            return d["total_records"];
        });
        var all = ndx.groupAll();
        var totalcounts = ndx.groupAll().reduceSum(function (d) { return d["total_counts"]; });
        var totalRecords = ndx.groupAll().reduceSum(function (d) { return d["total_records"]; });
        var max_fips = totalcountsByfips.top(1)[0].value;
        var numProjectsBypropertyType = propertyTypeDim.group().reduceSum(function (d) {
            return d["total_records"];
        });

                //Define values (to be used in charts)
                var minDate = dateDim.bottom(1)[0]["report_year"];
                var maxDate = dateDim.top(1)[0]["report_year"] + 1;


                //Charts
                var timeChart = dc.barChart("#time-chart");
                var loanTypeChart = dc.pieChart("#loan-type-row-chart");
                var preappovalLevelChart = dc.rowChart("#preappoval-level-row-chart");
                var numberProjectsND = dc.numberDisplay("#number-projects-nd");
                var totalcountsND = dc.numberDisplay("#total-counts-nd");
                var totalRecordsND = dc.numberDisplay("#total-records-nd");
                var fipsChart = dc.rowChart("#fips-row-chart");
                var actionTypeChart = dc.rowChart("#action-type-row-chart");
                var propertyTypeChart = dc.rowChart("#property-type-row-chart");
                var occupancyTypeChart = dc.rowChart("#occupancy-type-row-chart");
                occupancyTypeChart
                    .width(300)
                    .height(250)
                    .dimension(occupancyDim)
                    .group(numProjectsByOccupancy)
                    .elasticX(true)
                    .xAxis().ticks(4);

                propertyTypeChart
                    .width(300)
                    .height(250)
                    .dimension(propertyTypeDim)
                    .group(numProjectsBypropertyType)
                    .elasticX(true)
                    .xAxis().ticks(4);

                numberProjectsND
                    .formatNumber(d3.format("d"))
                    .valueAccessor(function (d) { return d; })
                    .group(all);

                totalcountsND
                    .formatNumber(d3.format("d"))
                    .valueAccessor(function (d) { return d; })
                    .group(totalcounts)
                    .formatNumber(d3.format(".3s"));

                totalRecordsND
                    .formatNumber(d3.format("d"))
                    .valueAccessor(function (d) { return d; })
                    .group(totalRecords)
                    .formatNumber(d3.format(".3s"));

                timeChart
                    .width(600)
                    .height(160)
                    .margins({ top: 10, right: 50, bottom: 30, left: 60 })
                    .dimension(dateDim)
                    .group(numProjectsByDate)
                    .transitionDuration(500)
                    //.x(d3.scale.linear().domain([minDate, maxDate]))
                    .x(d3.scale.ordinal().domain(dateDim))
                    .xUnits(dc.units.ordinal)
                    .elasticY(true)
                    .gap(20)
                    .xAxisLabel("Year")
                    .yAxis().ticks(4);

                fipsChart
                    .width(600)
                    .height(320)
                    .dimension(fipsDim)
                    .group(totalcountsByfips)
                    .elasticX(true)
                    .xAxis().ticks(4);

                loanTypeChart
                    .width(360)
                    .height(250)
                    .slicesCap(4)
                    .innerRadius(50)
                    .dimension(loanTypeDim)
                    .group(numProjectsByloanType)
                    .legend(dc.legend())
                    .label(function (d) { return d.data.key + ' ' + Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%'; });



                actionTypeChart
                    .width(300)
                    .height(250)
                    .dimension(actionTypeDim)
                    .group(numProjectsByactionType)
                    .elasticX(true)
                    .xAxis().ticks(4);


                preappovalLevelChart
                    .width(300)
                    .height(250)
                    .dimension(preappovalLevelDim)
                    .group(numProjectsBypreappovalLevel)
                    .elasticX(true)
                    .xAxis().ticks(4);

                dc.renderAll();
        });