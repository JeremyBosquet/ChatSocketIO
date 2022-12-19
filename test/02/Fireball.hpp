#pragma once
#include <iostream>

#include "ASpell.hpp"

class Fireball : public ASpell
{
    public:
        Fireball(void);
        ~Fireball();
        
        virtual ASpell *clone(void) const;
};