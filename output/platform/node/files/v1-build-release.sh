workPath=`pwd`
export outputPath=$workPath"/build-output"

echo "---------------- Starting build Logwire ----------------"
echo "Work directory: "$workPath
echo "Build target directory: "$outputPath

cd $workPath

mvn clean package -Dmaven.test.skip=true -Dmaven.source.skip=true -DskipFrontEndBuild=true -DskipCyclonedx=true -f "./logwire-build/pom.xml"


cd $workPath
rm -rf $outputPath
mkdir -p $outputPath"/config"
mkdir -p $outputPath"/lib"
mkdir -p $outputPath"/products"
mkdir -p $outputPath"/projects"
mkdir -p $outputPath"/tenants_config"

cp ./logwire-build/logwire-server/logwire-libs/logwire-web/target/logwire-web-*.jar $outputPath"/lib/"
cp ./logwire-build/logwire-server/logwire-starter/target/logwire-starter-*.jar $outputPath"/"
cp ./logwire-build/logwire-server/logwire-support/logwire-jasperreports-fonts/target/logwire-jasperreports-fonts-*.jar $outputPath"/lib/"

echo "Build complete and output to ["$outputPath"]"




