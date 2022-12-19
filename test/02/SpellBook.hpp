#pragma once

#include <iostream>
#include <map>
#include "ASpell.hpp"
#include "ATarget.hpp"

class SpellBook
{
    private:
        SpellBook &operator=(SpellBook const &other);
        SpellBook(SpellBook const &other);
        std::map<std::string, ASpell *> list;
    public:
        SpellBook(void);
        ~SpellBook();

        void    learnSpell(ASpell *other);
        void    forgetSpell(std::string const &spell_name);
        ASpell* createSpell(std::string const &spell_name);
};