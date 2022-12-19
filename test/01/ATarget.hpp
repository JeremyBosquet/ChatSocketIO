#pragma once

#include <iostream>
#include "ASpell.hpp"
class ASpell;
class ATarget{
    private:
        std::string type;
    public:
        ATarget(void);
        ATarget(ATarget const &other);
        ATarget &operator=(ATarget const &other);
        virtual ~ATarget();
        ATarget(std::string const &type);

        std::string const &getType(void) const;
    
        virtual ATarget *clone() const = 0;
        void getHitBySpell(ASpell const &other) const;
};