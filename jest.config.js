module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', 
      },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    }
  };