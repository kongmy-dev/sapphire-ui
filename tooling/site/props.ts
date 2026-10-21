import { join } from 'node:path';
import ts from 'typescript';

const platformFile = /(?:@types[\\/]react[\\/]|lib\.dom\.d\.ts$)/;
const typeFlags = ts.TypeFormatFlags.NoTruncation;

function defaultsOf(signature: ts.Signature) {
  const name = signature.getDeclaration()?.parameters[0]?.name;
  if (!name || !ts.isObjectBindingPattern(name))
    return new Map<string, string>();
  return new Map(
    name.elements.flatMap((item) =>
      item.initializer
        ? [
            [
              item.propertyName?.getText() ?? item.name.getText(),
              item.initializer.getText(),
            ],
          ]
        : [],
    ),
  );
}

function propRow(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  source: ts.SourceFile,
  defaults: ReadonlyMap<string, string>,
) {
  const declaration =
    symbol.valueDeclaration ?? symbol.declarations?.[0] ?? source;
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  return {
    name: symbol.name,
    type: checker.typeToString(type, source, typeFlags),
    required: !(symbol.flags & ts.SymbolFlags.Optional),
    defaultValue: defaults.get(symbol.name),
    platform:
      symbol.declarations?.every((item) =>
        platformFile.test(item.getSourceFile().fileName),
      ) ?? false,
  };
}

function signatureProps(
  checker: ts.TypeChecker,
  signature: ts.Signature,
  source: ts.SourceFile,
) {
  const parameter = signature.parameters[0];
  if (!parameter) return [];
  const type = checker.getTypeOfSymbolAtLocation(
    parameter,
    parameter.valueDeclaration ?? source,
  );
  const defaults = defaultsOf(signature);
  return (type.isUnion() ? type.types : [type]).map((branch) => ({
    name: checker.typeToString(branch, source, typeFlags),
    props: branch
      .getProperties()
      .map((symbol) => propRow(checker, symbol, source, defaults)),
  }));
}

function componentProps(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  source: ts.SourceFile,
) {
  const target =
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  const signatures = checker
    .getTypeOfSymbolAtLocation(target, target.valueDeclaration ?? source)
    .getCallSignatures();
  if (!signatures.length || !/^[A-Z]/.test(symbol.name)) return [];
  return [
    {
      name: symbol.name,
      supporting: false,
      definition: '',
      branches: signatures.flatMap((signature) =>
        signatureProps(checker, signature, source),
      ),
    },
  ];
}

function supportingType(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  source: ts.SourceFile,
) {
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const branches = (type.isUnion() ? type.types : [type])
    .filter((branch) => branch.flags & ts.TypeFlags.Object)
    .map((branch) => ({
      name: checker.typeToString(branch, source, typeFlags),
      props: branch
        .getProperties()
        .map((prop) => propRow(checker, prop, source, new Map())),
    }))
    .filter((branch) => branch.props.length);
  return {
    name: symbol.name,
    supporting: true,
    definition: checker.typeToString(
      type,
      source,
      typeFlags | ts.TypeFormatFlags.InTypeAlias,
    ),
    branches,
  };
}

function withSupportingTypes(
  checker: ts.TypeChecker,
  exports: ts.Symbol[],
  source: ts.SourceFile,
) {
  const components = exports.flatMap((symbol) =>
    componentProps(checker, symbol, source),
  );
  const pending = components.map((entry) => ({ entry, source }));
  const seen = new Set<ts.Symbol>();
  for (const item of pending) {
    const text = [
      item.entry.definition,
      ...item.entry.branches.flatMap((branch) =>
        branch.props.map((prop) => prop.type),
      ),
    ].join(' ');
    const referenced = referencedAliases(checker, item.source, text).filter(
      (symbol) => !seen.has(symbol),
    );
    for (const symbol of referenced) {
      seen.add(symbol);
      const scope = symbol.declarations?.[0]?.getSourceFile() ?? item.source;
      pending.push({
        entry: supportingType(checker, symbol, scope),
        source: scope,
      });
    }
  }
  return pending.map((item) => item.entry);
}

function referencedAliases(
  checker: ts.TypeChecker,
  source: ts.SourceFile,
  text: string,
) {
  return checker
    .getSymbolsInScope(source, ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Alias)
    .filter((symbol) => new RegExp(`\\b${symbol.name}\\b`).test(text))
    .map((symbol) => checker.getExportSymbolOfSymbol(symbol))
    .map((symbol) =>
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol,
    )
    .filter(
      (symbol) =>
        symbol.flags & ts.SymbolFlags.TypeAlias &&
        symbol.declarations?.every(
          (declaration) =>
            !declaration.getSourceFile().fileName.includes('/node_modules/'),
        ),
    );
}

export function propReader(root: string) {
  const config = ts.readConfigFile(
    join(root, 'tsconfig.package.json'),
    ts.sys.readFile,
  );
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
    );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  return (name: string) => {
    const source = program.getSourceFile(
      join(root, `components/${name}/${name}.tsx`),
    );
    if (!source) return [];
    const module = checker.getSymbolAtLocation(source);
    if (!module)
      throw new Error(`${source.fileName}: missing component module`);
    return withSupportingTypes(
      checker,
      checker.getExportsOfModule(module),
      source,
    );
  };
}

export type ComponentReference = ReturnType<ReturnType<typeof propReader>>;
