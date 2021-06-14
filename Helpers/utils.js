let Utils = {
    mixin: (receiver, supplier) => {
        Object.getOwnPropertyNames(supplier)
        .filter(property => property !== 'constructor')
        .forEach(property => {
            var descriptor = Object.getOwnPropertyDescriptor(supplier, property);
            Object.defineProperty(receiver, property, descriptor);
        });
  
        return receiver;
    }
};